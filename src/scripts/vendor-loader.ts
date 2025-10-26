import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Интерфейс для данных вендора
interface VendorData {
  displayName: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  logo?: string;
  website?: string;
  type?: 'START' | 'PRO';
  kycStatus?: 'DRAFT' | 'SUBMITTED' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED';
  payoutEnabled?: boolean;
  officialPartner?: boolean;
  supportEmail?: string;
  supportPhone?: string;
  subscriptionStatus?: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  proofType?: 'DOMAIN_EMAIL' | 'DNS_RECORD' | 'LETTER' | 'PHOTO';
  proofData?: string;
  fullName?: string;
  inn?: string;
  orgnip?: string;
  bankName?: string;
  bik?: string;
  account?: string;
  corrAccount?: string;
  isVatPayer?: boolean;
  vatRate?: number;
  representativeName?: string;
  representativePosition?: string;
  isRepresentative?: boolean;
  companyName?: string;
  kpp?: string;
  orgn?: string;
  legalAddress?: string;
  actualAddress?: string;
  directorName?: string;
  directorPosition?: string;
  selfEmployedInn?: string;
}

// Функция для загрузки вендоров
export async function loadVendorsFromFile(filePath: string) {
  try {
    console.log(`🏢 Загружаем вендоров из файла: ${filePath}`);
    
    // Читаем файл
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const vendorsData: VendorData[] = JSON.parse(fileContent);
    
    console.log(`📊 Найдено ${vendorsData.length} вендоров для загрузки`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const vendorData of vendorsData) {
      try {
        // Находим существующего пользователя или создаем нового
        let user = await prisma.user.findFirst({
          where: { email: vendorData.email || `vendor-${Date.now()}@example.com` }
        });
        
        if (!user) {
          // Создаем пользователя
          user = await prisma.user.create({
            data: {
              email: vendorData.email || `vendor-${Date.now()}@example.com`,
              name: vendorData.displayName,
              role: 'VENDOR',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });
        }
        
        // Находим город (используем существующий)
        const existingCity = await prisma.city.findFirst();
        if (!existingCity) {
          console.error('❌ Не найден ни один city в базе данных. Создайте city перед загрузкой вендоров.');
          continue;
        }
        
        // Создаем вендора
        const vendor = await prisma.vendor.create({
          data: {
            userId: user.id,
            displayName: vendorData.displayName,
            cityId: existingCity.id,
            canPostEvents: true,
            canPostCatalog: true,
            description: vendorData.description || null,
            address: vendorData.address || null,
            email: vendorData.email || null,
            logo: vendorData.logo || null,
            phone: vendorData.phone || null,
            website: vendorData.website || null,
            type: vendorData.type || 'START',
            kycStatus: vendorData.kycStatus || 'DRAFT',
            payoutEnabled: vendorData.payoutEnabled || false,
            officialPartner: vendorData.officialPartner || false,
            supportEmail: vendorData.supportEmail || null,
            supportPhone: vendorData.supportPhone || null,
            subscriptionStatus: vendorData.subscriptionStatus || 'INACTIVE',
            proofType: vendorData.proofType || null,
            proofData: vendorData.proofData || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        
        // Создаем роль вендора
        await prisma.vendorRole.create({
          data: {
            vendorId: vendor.id,
            role: 'LEGAL',
            fullName: vendorData.fullName || null,
            inn: vendorData.inn || null,
            orgnip: vendorData.orgnip || null,
            orgn: vendorData.orgn || null,
            kpp: vendorData.kpp || null,
            bankAccount: vendorData.account || null,
            bik: vendorData.bik || null,
            bankName: vendorData.bankName || null,
            corrAccount: vendorData.corrAccount || null,
            address: vendorData.address || null,
            legalAddress: vendorData.legalAddress || null,
            actualAddress: vendorData.actualAddress || null,
            isVatPayer: vendorData.isVatPayer || false,
            vatRate: vendorData.vatRate || null,
            representativeName: vendorData.representativeName || null,
            representativePosition: vendorData.representativePosition || null,
            isRepresentative: vendorData.isRepresentative || false,
            companyName: vendorData.companyName || null,
            directorName: vendorData.directorName || null,
            directorPosition: vendorData.directorPosition || null,
            selfEmployedInn: vendorData.selfEmployedInn || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        
        console.log(`✅ Вендор создан: ${vendor.displayName}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Ошибка при создании вендора "${vendorData.displayName}":`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Результат загрузки вендоров:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке вендоров:', error);
  }
}

// Функция для очистки вендоров
export async function clearVendors() {
  try {
    console.log('🧹 Очищаем вендоров...');
    
    // Удаляем роли вендоров
    const deletedRoles = await prisma.vendorRole.deleteMany();
    console.log(`🗑️ Удалено ролей вендоров: ${deletedRoles.count}`);
    
    // Удаляем вендоров
    const deletedVendors = await prisma.vendor.deleteMany();
    console.log(`🗑️ Удалено вендоров: ${deletedVendors.count}`);
    
  } catch (error) {
    console.error('❌ Ошибка при очистке вендоров:', error);
  }
}

// Основная функция загрузки
export async function loadVendorsFromFiles(vendorsFile?: string, clearFirst = false) {
  try {
    if (clearFirst) {
      await clearVendors();
    }
    
    if (vendorsFile) {
      await loadVendorsFromFile(vendorsFile);
    }
    
    console.log('\n🎉 Загрузка вендоров завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке вендоров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск загрузки (если файл запускается напрямую)
if (require.main === module) {
  const vendorsFile = process.argv[2];
  const clearFirst = process.argv[3] === '--clear';
  
  loadVendorsFromFiles(vendorsFile, clearFirst);
}
