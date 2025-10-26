import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromToken } from '@/lib/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 CLAIM API: Starting claim request');
    
    // Проверяем аутентификацию
    const sessionToken = request.cookies.get('session')?.value;
    console.log('🔍 CLAIM API: Session token check:', { hasToken: !!sessionToken });
    
    if (!sessionToken) {
      console.log('🔍 CLAIM API: No session token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSessionFromToken(sessionToken);
    console.log('🔍 CLAIM API: Session check:', { isAuthenticated: session.isAuthenticated, userId: session.user?.id });
    
    if (!session.isAuthenticated) {
      console.log('🔍 CLAIM API: Session not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    console.log('🔍 CLAIM API: Form data received');
    
    const venueId = parseInt(formData.get('venueId') as string);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const position = formData.get('position') as string;
    const comment = formData.get('comment') as string;
    const document = formData.get('document') as File | null;

    console.log('🔍 CLAIM API: Form data parsed:', {
      venueId,
      fullName,
      email,
      phone,
      position,
      comment,
      hasDocument: !!document
    });

    if (!venueId || !fullName || !email || !phone || !position) {
      console.log('🔍 CLAIM API: Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Проверяем, что место существует
    console.log('🔍 CLAIM API: Looking up venue:', venueId);
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId },
      select: { id: true, name: true, vendor: { select: { userId: true } } }
    });

    console.log('🔍 CLAIM API: Venue lookup result:', venue);

    if (!venue) {
      console.log('🔍 CLAIM API: Venue not found');
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Проверяем, что пользователь не является владельцем места
    if (venue.vendor.userId === parseInt(session.user!.id)) {
      console.log('🔍 CLAIM API: User trying to claim own venue');
      return NextResponse.json({ 
        error: 'You cannot claim your own venue' 
      }, { status: 400 });
    }

    // Сохраняем документ, если он есть
    let documentPath = null;
    if (document && document.size > 0) {
      // В реальном проекте здесь будет сохранение файла в файловую систему или облако
      const timestamp = Date.now();
      const fileName = `claim_${venueId}_${timestamp}_${document.name}`;
      documentPath = `/uploads/claims/${fileName}`;
      
      // TODO: Реализовать сохранение файла
      console.log(`Document would be saved to: ${documentPath}`);
    }

    // Находим вендора для текущего пользователя
    console.log('🔍 CLAIM API: Looking up vendor for user:', session.user!.id);
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user!.id) },
      select: { id: true }
    });

    console.log('🔍 CLAIM API: Vendor lookup result:', vendor);

    if (!vendor) {
      console.log('🔍 CLAIM API: User is not a vendor');
      return NextResponse.json({ 
        error: 'Для подачи заявки на управление местом необходимо быть зарегистрированным вендором. Пожалуйста, зарегистрируйтесь как вендор.' 
      }, { status: 400 });
    }

    // Создаем заявку на клейм
    console.log('🔍 CLAIM API: Creating venue claim');
    console.log('🔍 CLAIM API: Prisma client check:', {
      hasPrisma: !!prisma,
      hasVenueClaim: !!prisma.venueClaim,
      prismaKeys: Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'))
    });
    
    const claim = await prisma.venueClaim.create({
      data: {
        venueId: venueId,
        requestorVendorId: vendor.id, // ID вендора, подающего заявку
        status: 'PENDING',
        proofType: 'LETTER', // По умолчанию письмо-доверенность
        proofData: JSON.stringify({
          fullName,
          email,
          phone,
          position,
          comment,
          documentPath,
          submittedAt: new Date().toISOString()
        })
      }
    });

    console.log('🔍 CLAIM API: Claim created successfully:', claim.id);

    // TODO: Отправить уведомление администраторам
    console.log(`New venue claim created: ${claim.id} for venue ${venueId}`);

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      message: 'Claim submitted successfully'
    });

  } catch (error) {
    console.error('POST /api/listings/claim error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}