import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// POST /api/admin/users/bulk - массовые операции с пользователями
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const body = await request.json()
    const { action, userIds, data } = body

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ 
        error: 'Action and userIds array are required' 
      }, { status: 400 })
    }

    // Проверяем, что все ID валидны
    const validUserIds = userIds.filter(id => Number.isInteger(id) && id > 0)
    if (validUserIds.length !== userIds.length) {
      return NextResponse.json({ 
        error: 'All user IDs must be valid integers' 
      }, { status: 400 })
    }

    let result: unknown = {}

    switch (action) {
      case 'activate':
        // Активировать пользователей (верифицировать email)
        result = await prisma.user.updateMany({
          where: { id: { in: validUserIds } },
          data: { emailVerified: new Date() }
        })
        break

      case 'deactivate':
        // Деактивировать пользователей
        result = await prisma.user.updateMany({
          where: { id: { in: validUserIds } },
          data: { emailVerified: null }
        })
        break

      case 'changeRole':
        if (!data?.role) {
          return NextResponse.json({ 
            error: 'Role is required for changeRole action' 
          }, { status: 400 })
        }

        // Проверяем, что не удаляем последнего админа
        if (data.role !== 'ADMIN') {
          const adminUsers = await prisma.user.findMany({
            where: { 
              id: { in: validUserIds },
              role: 'ADMIN'
            },
            select: { id: true }
          })

          const remainingAdmins = await prisma.user.count({
            where: { 
              role: 'ADMIN',
              id: { notIn: validUserIds }
            }
          })

          if (adminUsers.length > 0 && remainingAdmins === 0) {
            return NextResponse.json({ 
              error: 'Cannot change role of all admin users' 
            }, { status: 400 })
          }
        }

        result = await prisma.user.updateMany({
          where: { id: { in: validUserIds } },
          data: { role: data.role }
        })
        break

      case 'delete':
        // Проверяем, что не удаляем последнего админа
        const adminUsers = await prisma.user.findMany({
          where: { 
            id: { in: validUserIds },
            role: 'ADMIN'
          },
          select: { id: true }
        })

        const remainingAdmins = await prisma.user.count({
          where: { 
            role: 'ADMIN',
            id: { notIn: validUserIds }
          }
        })

        if (adminUsers.length > 0 && remainingAdmins === 0) {
          return NextResponse.json({ 
            error: 'Cannot delete all admin users' 
          }, { status: 400 })
        }

        result = await prisma.user.deleteMany({
          where: { id: { in: validUserIds } }
        })
        break

      case 'addRoleAssignment':
        if (!data?.role || !data?.scopeType) {
          return NextResponse.json({ 
            error: 'Role and scopeType are required for addRoleAssignment action' 
          }, { status: 400 })
        }

        // Добавляем роли пользователям
        const roleAssignments = validUserIds.map(userId => ({
          userId,
          role: data.role,
          scopeType: data.scopeType,
          scopeId: data.scopeId || null,
          cityId: data.cityId || null,
          categoryId: data.categoryId || null,
          vendorId: data.vendorId || null,
          updatedAt: new Date()
        }))

    result = await prisma.roleAssignment.createMany({
      data: roleAssignments
    })
        break

      case 'removeRoleAssignment':
        if (!data?.role) {
          return NextResponse.json({ 
            error: 'Role is required for removeRoleAssignment action' 
          }, { status: 400 })
        }

        // Удаляем роли у пользователей
        const whereClause: any = {
          userId: { in: validUserIds },
          role: data.role
        }

        if (data.scopeType) whereClause.scopeType = (data as any).scopeType
        if (data.scopeId) whereClause.scopeId = (data as any).scopeId
        if (data.cityId) whereClause.cityId = (data as any).cityId
        if (data.categoryId) whereClause.categoryId = (data as any).categoryId
        if (data.vendorId) whereClause.vendorId = (data as any).vendorId

        result = await prisma.roleAssignment.deleteMany({
          where: whereClause
        })
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Supported actions: activate, deactivate, changeRole, delete, addRoleAssignment, removeRoleAssignment' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      affectedCount: (result as any).count || result,
      message: `Successfully processed ${(result as any).count || result} users`
    })
  } catch (error) {
    console.error('Error in bulk user operation:', error)
    return NextResponse.json({ 
      error: 'Failed to process bulk operation',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

