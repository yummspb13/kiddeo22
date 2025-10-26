-- CreateTable
CREATE TABLE "City" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultBookingMode" TEXT NOT NULL DEFAULT 'REQUEST',
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VenueCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VenueCategoryCity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VenueCategoryCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueCategoryCity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VenueCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueSubcategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PLACE',
    "categoryId" INTEGER NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "backgroundImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VenueCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueSubcategoryCity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subcategoryId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VenueSubcategoryCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueSubcategoryCity_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "VenueSubcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueParameter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subcategoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isOptimal" BOOLEAN NOT NULL DEFAULT false,
    "isMaximum" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueParameter_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "VenueSubcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueFilter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subcategoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueFilter_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "VenueSubcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenuePartner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "additionalImages" TEXT,
    "subcategoryId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "tariff" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "moderationReason" TEXT,
    "district" TEXT,
    "metro" TEXT,
    "lat" REAL,
    "lng" REAL,
    "priceFrom" INTEGER,
    "priceTo" INTEGER,
    "ageFrom" INTEGER,
    "ageTo" INTEGER,
    "timezone" TEXT,
    "fiasId" TEXT,
    "kladrId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenuePartner_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VenuePartner_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VenuePartner_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "VenueSubcategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenuePartnerParameter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partnerId" INTEGER NOT NULL,
    "parameterId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenuePartnerParameter_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "VenueParameter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenuePartnerParameter_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueVendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "documentsStatus" TEXT NOT NULL DEFAULT 'NONE',
    "documentsChecked" BOOLEAN NOT NULL DEFAULT false,
    "documentsCheckedAt" DATETIME,
    "documentsCheckedBy" INTEGER,
    "fullName" TEXT,
    "inn" TEXT,
    "orgnip" TEXT,
    "bankAccount" TEXT,
    "bik" TEXT,
    "address" TEXT,
    "isVatPayer" BOOLEAN NOT NULL DEFAULT false,
    "vatRate" INTEGER,
    "egryulDocument" TEXT,
    "representativeName" TEXT,
    "representativePosition" TEXT,
    "isRepresentative" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "kpp" TEXT,
    "orgn" TEXT,
    "legalAddress" TEXT,
    "actualAddress" TEXT,
    "directorName" TEXT,
    "directorPosition" TEXT,
    "selfEmployedInn" TEXT,
    "agreementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "agreementAcceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueVendor_documentsCheckedBy_fkey" FOREIGN KEY ("documentsCheckedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueVendorUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VenueVendorUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueVendorUser_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VenueVendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "canPostEvents" BOOLEAN NOT NULL DEFAULT false,
    "canPostCatalog" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "type" TEXT NOT NULL DEFAULT 'START',
    "kycStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "payoutEnabled" BOOLEAN NOT NULL DEFAULT false,
    "officialPartner" BOOLEAN NOT NULL DEFAULT false,
    "brandSlug" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
    "proofType" TEXT,
    "proofData" TEXT,
    "additionalProofData" TEXT,
    "agreements" JSONB,
    CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vendor_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "bookingMode" TEXT NOT NULL,
    "enforceAdminMode" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "lat" REAL,
    "lng" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ageFrom" INTEGER,
    "ageTo" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isIndoor" BOOLEAN,
    "district" TEXT,
    "priceFrom" INTEGER,
    "priceTo" INTEGER,
    "eventDate" DATETIME,
    "eventEndDate" DATETIME,
    "images" TEXT,
    "claimable" BOOLEAN NOT NULL DEFAULT false,
    "claimStatus" TEXT DEFAULT 'PENDING',
    CONSTRAINT "Listing_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "fullName" TEXT,
    "inn" TEXT,
    "orgnip" TEXT,
    "orgn" TEXT,
    "kpp" TEXT,
    "bankAccount" TEXT,
    "bik" TEXT,
    "bankName" TEXT,
    "corrAccount" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "address" TEXT,
    "legalAddress" TEXT,
    "actualAddress" TEXT,
    "isVatPayer" BOOLEAN NOT NULL DEFAULT false,
    "vatRate" INTEGER,
    "representativeName" TEXT,
    "representativePosition" TEXT,
    "isRepresentative" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "directorName" TEXT,
    "directorPosition" TEXT,
    "selfEmployedInn" TEXT,
    "taxRegime" TEXT,
    "npdToken" TEXT,
    "npdRegion" TEXT,
    "moderatorNotes" TEXT,
    "moderatedBy" INTEGER,
    "moderatedAt" DATETIME,
    "moderatorIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VendorRole_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorRole_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "docType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "issuedAt" DATETIME,
    "expiresAt" DATETIME,
    "moderatorNotes" TEXT,
    "rejectionReason" TEXT,
    "moderatorId" INTEGER,
    "moderatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "holderName" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bik" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "corrAccount" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "moderatorNotes" TEXT,
    "moderatorId" INTEGER,
    "moderatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankAccount_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BankAccount_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "taxRegime" TEXT NOT NULL,
    "vatStatus" TEXT NOT NULL DEFAULT 'NONE',
    "vatRate" INTEGER,
    "isVatPayer" BOOLEAN NOT NULL DEFAULT false,
    "npdToken" TEXT,
    "npdRegion" TEXT,
    "fiscalMode" TEXT NOT NULL DEFAULT 'PLATFORM',
    "agencyAgreement" BOOLEAN NOT NULL DEFAULT false,
    "moderatorNotes" TEXT,
    "moderatorId" INTEGER,
    "moderatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaxProfile_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaxProfile_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingClaim" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "requestorVendorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofType" TEXT NOT NULL,
    "proofData" TEXT,
    "moderatorId" INTEGER,
    "moderatorNotes" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListingClaim_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListingClaim_requestorVendorId_fkey" FOREIGN KEY ("requestorVendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ListingClaim_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Slot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalRub" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "ticketTypeId" TEXT,
    "slotId" INTEGER,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "priceRub" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookingItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BookingItem_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER,
    "bookingId" INTEGER,
    "vendorId" INTEGER,
    "subscriptionId" INTEGER,
    "orderId" TEXT,
    "userId" INTEGER,
    "email" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "ykId" TEXT,
    "ykUrl" TEXT,
    "paymentMethod" TEXT,
    "externalId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "VendorSubscription" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuickFilter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cityId" INTEGER,
    "page" TEXT NOT NULL DEFAULT 'afisha',
    "label" TEXT NOT NULL,
    "queryJson" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "QuickFilter_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hideFromAfisha" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT NOT NULL,
    "citySlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CollectionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollectionEvent_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AfishaEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AfishaEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT DEFAULT '',
    "description" TEXT,
    "venue" TEXT NOT NULL,
    "organizer" TEXT,
    "startDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "coordinates" TEXT,
    "order" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'active',
    "coverImage" TEXT,
    "gallery" TEXT,
    "tickets" TEXT,
    "city" TEXT NOT NULL,
    "citySlug" TEXT,
    "category" TEXT,
    "categoryId" INTEGER,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "ageFrom" INTEGER,
    "ageTo" INTEGER,
    "minPrice" INTEGER,
    "ageGroups" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "searchText" TEXT NOT NULL DEFAULT '',
    "quickFilterIds" TEXT,
    CONSTRAINT "AfishaEvent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AfishaEvent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AfishaCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventTicketType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT,
    "listingId" INTEGER,
    "name" TEXT NOT NULL,
    "price" INTEGER,
    "currency" TEXT,
    CONSTRAINT "EventTicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AfishaEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventTicketType_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AfishaCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "coverImage" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIAssistant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "tokensUsed" INTEGER,
    "cost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "AIAssistant_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "listingId" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIRecommendation_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AIRecommendation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adPlacementId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMPRESSION',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "ua" TEXT,
    "cityId" INTEGER,
    CONSTRAINT "AdEvent_adPlacementId_fkey" FOREIGN KEY ("adPlacementId") REFERENCES "AdPlacement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdEvent_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdPlacement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "page" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "hrefUrl" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cityId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "AdPlacement_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminAudit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" INTEGER,
    "details" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminDashboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminDashboard_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminInsight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "recommendations" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminInsight_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "listingId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chat_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "chatId" INTEGER,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatTemplate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatTemplate_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Content" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "categoryId" INTEGER,
    "cityId" INTEGER,
    "authorId" INTEGER NOT NULL,
    "editorId" INTEGER,
    "reviewerId" INTEGER,
    "publishedAt" DATETIME,
    "scheduledAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Content_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ContentCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Content_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Content_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Content_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentAnalytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "timeOnPage" REAL,
    "bounceRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentAnalytics_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContentComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "parentId" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentComment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentLike" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentLike_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contentId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentListing_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "toName" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "variables" JSONB,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FilterConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scope" TEXT NOT NULL,
    "cityId" INTEGER,
    "categoryId" INTEGER,
    "subcategoryId" TEXT,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FilterConfig_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FilterConfig_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "vendorId" INTEGER,
    "cityId" INTEGER,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "message" TEXT,
    "desiredAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lead_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingCommission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL DEFAULT 15,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedByUserId" INTEGER,
    CONSTRAINT "ListingCommission_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ListingCommission_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingModeration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "comment" TEXT,
    "moderatorId" INTEGER,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListingModeration_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ListingModeration_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "interestId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListingTag_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListingTag_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoyaltyPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "orderId" TEXT,
    "description" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoyaltyPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoyaltyPoint_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chatId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "senderType" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "finalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "promoCodeId" TEXT,
    "loyaltyPointsUsed" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "details" JSONB,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payout_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payout_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PopularEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" TEXT,
    "date" DATETIME,
    "location" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "cityId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tickets" TEXT,
    "vendorName" TEXT,
    "coordinatesLat" REAL,
    "coordinatesLng" REAL,
    "images" TEXT,
    CONSTRAINT "PopularEvent_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "minOrderAmount" INTEGER,
    "maxDiscount" INTEGER,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "applicableTo" JSONB,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PublicationPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublicationPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublicationPlanItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "contentId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "assignedTo" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublicationPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PublicationPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublicationPlanItem_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PublicationPlanItem_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "externalId" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderatorId" INTEGER,
    "moderatedAt" DATETIME,
    "vendorReply" TEXT,
    "replyAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL DEFAULT 'GLOBAL',
    "scopeId" INTEGER,
    "cityId" INTEGER,
    "categoryId" INTEGER,
    "vendorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoleAssignment_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RoleAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RoleAssignment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SLARule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SLARule_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionVisibility" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scope" TEXT NOT NULL,
    "cityId" INTEGER,
    "categoryId" INTEGER,
    "subcategoryId" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "hideIfEmpty" BOOLEAN NOT NULL DEFAULT false,
    "customTitle" TEXT,
    "customDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SectionVisibility_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SectionVisibility_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockAvatar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "usedAt" DATETIME,
    "usedBy" INTEGER,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBehaviorEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "element" TEXT,
    "data" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBehaviorEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserChild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "interests" JSONB,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserChild_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" INTEGER,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderatedAt" DATETIME,
    "moderatorId" INTEGER,
    "moderationNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserComment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "UserComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserComment_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCommentVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "vote" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "UserComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFavorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "interestId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserLoyaltyPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "source" TEXT,
    "sourceId" INTEGER,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserLoyaltyPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserNotificationSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "emailNewEvents" BOOLEAN NOT NULL DEFAULT true,
    "emailPriceDrops" BOOLEAN NOT NULL DEFAULT true,
    "emailReminders" BOOLEAN NOT NULL DEFAULT true,
    "emailReviews" BOOLEAN NOT NULL DEFAULT true,
    "emailNewsletter" BOOLEAN NOT NULL DEFAULT true,
    "pushNewEvents" BOOLEAN NOT NULL DEFAULT true,
    "pushPriceDrops" BOOLEAN NOT NULL DEFAULT false,
    "pushReminders" BOOLEAN NOT NULL DEFAULT true,
    "pushReviews" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "photos" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderatedAt" DATETIME,
    "moderatorId" INTEGER,
    "moderationNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserReview_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserReview_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserReviewVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "vote" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserReviewVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserReviewVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "UserReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorOnboarding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" JSONB NOT NULL DEFAULT [],
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VendorOnboarding_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorPerformanceMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "period" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendorPerformanceMetric_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "tariffPlanId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VendorSubscription_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VendorSubscription_tariffPlanId_fkey" FOREIGN KEY ("tariffPlanId") REFERENCES "VendorTariffPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorTariffPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tariff" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "maxListings" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PopularCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "cityId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PopularCategory_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AfishaEventPopularCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "afishaEventId" TEXT NOT NULL,
    "popularCategoryId" INTEGER NOT NULL,
    "isPermanent" BOOLEAN NOT NULL DEFAULT false,
    "daysToShow" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AfishaEventPopularCategory_popularCategoryId_fkey" FOREIGN KEY ("popularCategoryId") REFERENCES "PopularCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AfishaEventPopularCategory_afishaEventId_fkey" FOREIGN KEY ("afishaEventId") REFERENCES "AfishaEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MODERATION',
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "dislikesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventReview_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AfishaEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "photos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MODERATION',
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "dislikesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueReview_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "VenuePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewReaction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "EventReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueReviewReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VenueReviewReaction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "VenueReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueReviewReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "EventReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueReviewReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VenueReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "VenueReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VenueReviewReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPoints" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'NOVICE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PointsTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderId" TEXT,
    "eventId" TEXT,
    "venueId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PointsTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PointsTransaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AfishaEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PointsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserPoints" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserReward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "usedAt" DATETIME,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserReward_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserPoints" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserInvite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inviterId" INTEGER NOT NULL,
    "inviteeId" INTEGER,
    "inviteCode" TEXT NOT NULL,
    "email" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME,
    CONSTRAINT "UserInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "userId" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorModerationHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "moderatorId" INTEGER,
    "moderatorNotes" TEXT,
    "rejectionReason" TEXT,
    "documentsCount" INTEGER,
    "documentsList" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendorModerationHistory_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorModerationHistory_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventView_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AfishaEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "city" TEXT NOT NULL,
    "eventIds" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "rotationFrequency" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VenueCategory_name_key" ON "VenueCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VenueCategory_slug_key" ON "VenueCategory"("slug");

-- CreateIndex
CREATE INDEX "VenueCategoryCity_categoryId_idx" ON "VenueCategoryCity"("categoryId");

-- CreateIndex
CREATE INDEX "VenueCategoryCity_cityId_idx" ON "VenueCategoryCity"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueCategoryCity_categoryId_cityId_key" ON "VenueCategoryCity"("categoryId", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueSubcategory_name_key" ON "VenueSubcategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VenueSubcategory_slug_key" ON "VenueSubcategory"("slug");

-- CreateIndex
CREATE INDEX "VenueSubcategoryCity_subcategoryId_idx" ON "VenueSubcategoryCity"("subcategoryId");

-- CreateIndex
CREATE INDEX "VenueSubcategoryCity_cityId_idx" ON "VenueSubcategoryCity"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueSubcategoryCity_subcategoryId_cityId_key" ON "VenueSubcategoryCity"("subcategoryId", "cityId");

-- CreateIndex
CREATE INDEX "VenueParameter_subcategoryId_idx" ON "VenueParameter"("subcategoryId");

-- CreateIndex
CREATE INDEX "VenueParameter_isActive_idx" ON "VenueParameter"("isActive");

-- CreateIndex
CREATE INDEX "VenueFilter_subcategoryId_idx" ON "VenueFilter"("subcategoryId");

-- CreateIndex
CREATE INDEX "VenueFilter_isVisible_idx" ON "VenueFilter"("isVisible");

-- CreateIndex
CREATE INDEX "VenueFilter_order_idx" ON "VenueFilter"("order");

-- CreateIndex
CREATE UNIQUE INDEX "VenuePartner_slug_key" ON "VenuePartner"("slug");

-- CreateIndex
CREATE INDEX "VenuePartner_subcategoryId_idx" ON "VenuePartner"("subcategoryId");

-- CreateIndex
CREATE INDEX "VenuePartner_vendorId_idx" ON "VenuePartner"("vendorId");

-- CreateIndex
CREATE INDEX "VenuePartner_status_idx" ON "VenuePartner"("status");

-- CreateIndex
CREATE INDEX "VenuePartnerParameter_partnerId_idx" ON "VenuePartnerParameter"("partnerId");

-- CreateIndex
CREATE INDEX "VenuePartnerParameter_parameterId_idx" ON "VenuePartnerParameter"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "VenuePartnerParameter_partnerId_parameterId_key" ON "VenuePartnerParameter"("partnerId", "parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueVendor_vendorId_key" ON "VenueVendor"("vendorId");

-- CreateIndex
CREATE INDEX "VenueVendor_status_idx" ON "VenueVendor"("status");

-- CreateIndex
CREATE INDEX "VenueVendor_type_idx" ON "VenueVendor"("type");

-- CreateIndex
CREATE INDEX "VenueVendor_documentsStatus_idx" ON "VenueVendor"("documentsStatus");

-- CreateIndex
CREATE INDEX "VenueVendorUser_vendorId_idx" ON "VenueVendorUser"("vendorId");

-- CreateIndex
CREATE INDEX "VenueVendorUser_userId_idx" ON "VenueVendorUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueVendorUser_vendorId_userId_key" ON "VenueVendorUser"("vendorId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "Vendor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_brandSlug_key" ON "Vendor"("brandSlug");

-- CreateIndex
CREATE INDEX "Vendor_cityId_idx" ON "Vendor"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "Listing_vendorId_idx" ON "Listing"("vendorId");

-- CreateIndex
CREATE INDEX "Listing_cityId_idx" ON "Listing"("cityId");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorRole_vendorId_key" ON "VendorRole"("vendorId");

-- CreateIndex
CREATE INDEX "VendorRole_role_idx" ON "VendorRole"("role");

-- CreateIndex
CREATE INDEX "VendorRole_inn_idx" ON "VendorRole"("inn");

-- CreateIndex
CREATE INDEX "VendorRole_orgnip_idx" ON "VendorRole"("orgnip");

-- CreateIndex
CREATE INDEX "VendorRole_orgn_idx" ON "VendorRole"("orgn");

-- CreateIndex
CREATE INDEX "Document_vendorId_docType_idx" ON "Document"("vendorId", "docType");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "BankAccount_inn_idx" ON "BankAccount"("inn");

-- CreateIndex
CREATE INDEX "BankAccount_verified_idx" ON "BankAccount"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_vendorId_key" ON "BankAccount"("vendorId");

-- CreateIndex
CREATE INDEX "TaxProfile_taxRegime_idx" ON "TaxProfile"("taxRegime");

-- CreateIndex
CREATE UNIQUE INDEX "TaxProfile_vendorId_key" ON "TaxProfile"("vendorId");

-- CreateIndex
CREATE INDEX "ListingClaim_listingId_idx" ON "ListingClaim"("listingId");

-- CreateIndex
CREATE INDEX "ListingClaim_requestorVendorId_idx" ON "ListingClaim"("requestorVendorId");

-- CreateIndex
CREATE INDEX "ListingClaim_status_idx" ON "ListingClaim"("status");

-- CreateIndex
CREATE INDEX "ListingClaim_submittedAt_idx" ON "ListingClaim"("submittedAt");

-- CreateIndex
CREATE INDEX "Slot_listingId_idx" ON "Slot"("listingId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_listingId_idx" ON "Booking"("listingId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "BookingItem_bookingId_idx" ON "BookingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItem_ticketTypeId_idx" ON "BookingItem"("ticketTypeId");

-- CreateIndex
CREATE INDEX "BookingItem_slotId_idx" ON "BookingItem"("slotId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_ykId_key" ON "Payment"("ykId");

-- CreateIndex
CREATE INDEX "Payment_listingId_idx" ON "Payment"("listingId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_externalId_idx" ON "Payment"("externalId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_vendorId_status_idx" ON "Payment"("vendorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionEvent_collectionId_eventId_key" ON "CollectionEvent"("collectionId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "AfishaEvent_slug_key" ON "AfishaEvent"("slug");

-- CreateIndex
CREATE INDEX "AfishaEvent_status_citySlug_idx" ON "AfishaEvent"("status", "citySlug");

-- CreateIndex
CREATE INDEX "AfishaEvent_ageFrom_ageTo_idx" ON "AfishaEvent"("ageFrom", "ageTo");

-- CreateIndex
CREATE INDEX "AfishaEvent_minPrice_idx" ON "AfishaEvent"("minPrice");

-- CreateIndex
CREATE INDEX "AfishaEvent_startDate_idx" ON "AfishaEvent"("startDate");

-- CreateIndex
CREATE INDEX "AfishaEvent_searchText_idx" ON "AfishaEvent"("searchText");

-- CreateIndex
CREATE INDEX "EventTicketType_eventId_idx" ON "EventTicketType"("eventId");

-- CreateIndex
CREATE INDEX "EventTicketType_listingId_idx" ON "EventTicketType"("listingId");

-- CreateIndex
CREATE INDEX "EventTicketType_price_idx" ON "EventTicketType"("price");

-- CreateIndex
CREATE UNIQUE INDEX "AfishaCategory_name_key" ON "AfishaCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AfishaCategory_slug_key" ON "AfishaCategory"("slug");

-- CreateIndex
CREATE INDEX "AIAssistant_status_createdAt_idx" ON "AIAssistant"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AIAssistant_vendorId_type_idx" ON "AIAssistant"("vendorId", "type");

-- CreateIndex
CREATE INDEX "AIRecommendation_isApplied_idx" ON "AIRecommendation"("isApplied");

-- CreateIndex
CREATE INDEX "AIRecommendation_priority_createdAt_idx" ON "AIRecommendation"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "AIRecommendation_vendorId_type_idx" ON "AIRecommendation"("vendorId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "AdEvent_adPlacementId_type_createdAt_idx" ON "AdEvent"("adPlacementId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "AdPlacement_page_position_isActive_idx" ON "AdPlacement"("page", "position", "isActive");

-- CreateIndex
CREATE INDEX "AdminAudit_userId_createdAt_idx" ON "AdminAudit"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminDashboard_isDefault_idx" ON "AdminDashboard"("isDefault");

-- CreateIndex
CREATE INDEX "AdminDashboard_createdBy_idx" ON "AdminDashboard"("createdBy");

-- CreateIndex
CREATE INDEX "AdminInsight_priority_createdAt_idx" ON "AdminInsight"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "AdminInsight_isResolved_createdAt_idx" ON "AdminInsight"("isResolved", "createdAt");

-- CreateIndex
CREATE INDEX "AdminInsight_type_priority_idx" ON "AdminInsight"("type", "priority");

-- CreateIndex
CREATE INDEX "Chat_listingId_idx" ON "Chat"("listingId");

-- CreateIndex
CREATE INDEX "Chat_customerId_status_idx" ON "Chat"("customerId", "status");

-- CreateIndex
CREATE INDEX "Chat_vendorId_status_idx" ON "Chat"("vendorId", "status");

-- CreateIndex
CREATE INDEX "ChatTemplate_isActive_idx" ON "ChatTemplate"("isActive");

-- CreateIndex
CREATE INDEX "ChatTemplate_vendorId_category_idx" ON "ChatTemplate"("vendorId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- CreateIndex
CREATE INDEX "Content_cityId_idx" ON "Content"("cityId");

-- CreateIndex
CREATE INDEX "Content_categoryId_idx" ON "Content"("categoryId");

-- CreateIndex
CREATE INDEX "Content_scheduledAt_idx" ON "Content"("scheduledAt");

-- CreateIndex
CREATE INDEX "Content_publishedAt_idx" ON "Content"("publishedAt");

-- CreateIndex
CREATE INDEX "Content_authorId_idx" ON "Content"("authorId");

-- CreateIndex
CREATE INDEX "Content_status_idx" ON "Content"("status");

-- CreateIndex
CREATE INDEX "Content_type_idx" ON "Content"("type");

-- CreateIndex
CREATE INDEX "ContentAnalytics_contentId_idx" ON "ContentAnalytics"("contentId");

-- CreateIndex
CREATE INDEX "ContentAnalytics_date_idx" ON "ContentAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAnalytics_contentId_date_key" ON "ContentAnalytics"("contentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ContentCategory_name_key" ON "ContentCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ContentCategory_slug_key" ON "ContentCategory"("slug");

-- CreateIndex
CREATE INDEX "ContentCategory_sortOrder_idx" ON "ContentCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "ContentCategory_isActive_idx" ON "ContentCategory"("isActive");

-- CreateIndex
CREATE INDEX "ContentComment_isApproved_idx" ON "ContentComment"("isApproved");

-- CreateIndex
CREATE INDEX "ContentComment_parentId_idx" ON "ContentComment"("parentId");

-- CreateIndex
CREATE INDEX "ContentComment_userId_idx" ON "ContentComment"("userId");

-- CreateIndex
CREATE INDEX "ContentComment_contentId_idx" ON "ContentComment"("contentId");

-- CreateIndex
CREATE INDEX "ContentLike_userId_idx" ON "ContentLike"("userId");

-- CreateIndex
CREATE INDEX "ContentLike_contentId_idx" ON "ContentLike"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentLike_contentId_userId_key" ON "ContentLike"("contentId", "userId");

-- CreateIndex
CREATE INDEX "ContentListing_listingId_idx" ON "ContentListing"("listingId");

-- CreateIndex
CREATE INDEX "ContentListing_contentId_idx" ON "ContentListing"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentListing_contentId_listingId_key" ON "ContentListing"("contentId", "listingId");

-- CreateIndex
CREATE INDEX "ContentTemplate_createdById_idx" ON "ContentTemplate"("createdById");

-- CreateIndex
CREATE INDEX "ContentTemplate_isActive_idx" ON "ContentTemplate"("isActive");

-- CreateIndex
CREATE INDEX "ContentTemplate_type_idx" ON "ContentTemplate"("type");

-- CreateIndex
CREATE INDEX "EmailLog_status_createdAt_idx" ON "EmailLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_toEmail_idx" ON "EmailLog"("toEmail");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "EmailTemplate_name_idx" ON "EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "FilterConfig_order_idx" ON "FilterConfig"("order");

-- CreateIndex
CREATE INDEX "FilterConfig_isVisible_idx" ON "FilterConfig"("isVisible");

-- CreateIndex
CREATE INDEX "FilterConfig_type_idx" ON "FilterConfig"("type");

-- CreateIndex
CREATE INDEX "FilterConfig_scope_cityId_categoryId_subcategoryId_idx" ON "FilterConfig"("scope", "cityId", "categoryId", "subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_slug_key" ON "Interest"("slug");

-- CreateIndex
CREATE INDEX "Interest_isActive_idx" ON "Interest"("isActive");

-- CreateIndex
CREATE INDEX "Interest_category_idx" ON "Interest"("category");

-- CreateIndex
CREATE INDEX "Interest_slug_idx" ON "Interest"("slug");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_vendorId_idx" ON "Lead"("vendorId");

-- CreateIndex
CREATE INDEX "Lead_listingId_idx" ON "Lead"("listingId");

-- CreateIndex
CREATE INDEX "ListingCommission_effectiveFrom_idx" ON "ListingCommission"("effectiveFrom");

-- CreateIndex
CREATE INDEX "ListingCommission_listingId_idx" ON "ListingCommission"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingModeration_listingId_key" ON "ListingModeration"("listingId");

-- CreateIndex
CREATE INDEX "ListingModeration_moderatorId_idx" ON "ListingModeration"("moderatorId");

-- CreateIndex
CREATE INDEX "ListingModeration_listingId_status_idx" ON "ListingModeration"("listingId", "status");

-- CreateIndex
CREATE INDEX "ListingTag_interestId_idx" ON "ListingTag"("interestId");

-- CreateIndex
CREATE INDEX "ListingTag_listingId_idx" ON "ListingTag"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingTag_listingId_interestId_key" ON "ListingTag"("listingId", "interestId");

-- CreateIndex
CREATE INDEX "LoyaltyPoint_expiresAt_idx" ON "LoyaltyPoint"("expiresAt");

-- CreateIndex
CREATE INDEX "LoyaltyPoint_action_createdAt_idx" ON "LoyaltyPoint"("action", "createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyPoint_userId_idx" ON "LoyaltyPoint"("userId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_channel_idx" ON "Notification"("type", "channel");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Order_expiresAt_idx" ON "Order"("expiresAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_vendorId_status_idx" ON "Order"("vendorId", "status");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "Payout_vendorId_status_idx" ON "Payout"("vendorId", "status");

-- CreateIndex
CREATE INDEX "PopularEvent_startDate_endDate_idx" ON "PopularEvent"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "PopularEvent_cityId_idx" ON "PopularEvent"("cityId");

-- CreateIndex
CREATE INDEX "PopularEvent_order_idx" ON "PopularEvent"("order");

-- CreateIndex
CREATE INDEX "PopularEvent_isActive_idx" ON "PopularEvent"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_validFrom_validUntil_idx" ON "PromoCode"("isActive", "validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PublicationPlan_createdById_idx" ON "PublicationPlan"("createdById");

-- CreateIndex
CREATE INDEX "PublicationPlan_startDate_idx" ON "PublicationPlan"("startDate");

-- CreateIndex
CREATE INDEX "PublicationPlan_isActive_idx" ON "PublicationPlan"("isActive");

-- CreateIndex
CREATE INDEX "PublicationPlanItem_assignedTo_idx" ON "PublicationPlanItem"("assignedTo");

-- CreateIndex
CREATE INDEX "PublicationPlanItem_status_idx" ON "PublicationPlanItem"("status");

-- CreateIndex
CREATE INDEX "PublicationPlanItem_scheduledDate_idx" ON "PublicationPlanItem"("scheduledDate");

-- CreateIndex
CREATE INDEX "PublicationPlanItem_planId_idx" ON "PublicationPlanItem"("planId");

-- CreateIndex
CREATE INDEX "Refund_status_idx" ON "Refund"("status");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE INDEX "Refund_orderId_idx" ON "Refund"("orderId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_vendorId_isModerated_idx" ON "Review"("vendorId", "isModerated");

-- CreateIndex
CREATE INDEX "Review_listingId_isPublic_idx" ON "Review"("listingId", "isPublic");

-- CreateIndex
CREATE INDEX "RoleAssignment_vendorId_idx" ON "RoleAssignment"("vendorId");

-- CreateIndex
CREATE INDEX "RoleAssignment_categoryId_idx" ON "RoleAssignment"("categoryId");

-- CreateIndex
CREATE INDEX "RoleAssignment_cityId_idx" ON "RoleAssignment"("cityId");

-- CreateIndex
CREATE INDEX "RoleAssignment_scopeType_scopeId_idx" ON "RoleAssignment"("scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "RoleAssignment_role_idx" ON "RoleAssignment"("role");

-- CreateIndex
CREATE INDEX "RoleAssignment_userId_idx" ON "RoleAssignment"("userId");

-- CreateIndex
CREATE INDEX "SLARule_isActive_idx" ON "SLARule"("isActive");

-- CreateIndex
CREATE INDEX "SLARule_vendorId_type_idx" ON "SLARule"("vendorId", "type");

-- CreateIndex
CREATE INDEX "SectionVisibility_categoryId_idx" ON "SectionVisibility"("categoryId");

-- CreateIndex
CREATE INDEX "SectionVisibility_cityId_idx" ON "SectionVisibility"("cityId");

-- CreateIndex
CREATE INDEX "SectionVisibility_isVisible_idx" ON "SectionVisibility"("isVisible");

-- CreateIndex
CREATE INDEX "SectionVisibility_scope_idx" ON "SectionVisibility"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "SectionVisibility_scope_cityId_categoryId_subcategoryId_key" ON "SectionVisibility"("scope", "cityId", "categoryId", "subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "StockAvatar_url_key" ON "StockAvatar"("url");

-- CreateIndex
CREATE INDEX "StockAvatar_isActive_idx" ON "StockAvatar"("isActive");

-- CreateIndex
CREATE INDEX "StockAvatar_category_idx" ON "StockAvatar"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qrCode_key" ON "Ticket"("qrCode");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_qrCode_idx" ON "Ticket"("qrCode");

-- CreateIndex
CREATE INDEX "Ticket_vendorId_idx" ON "Ticket"("vendorId");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");

-- CreateIndex
CREATE INDEX "UserBehaviorEvent_eventType_createdAt_idx" ON "UserBehaviorEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "UserBehaviorEvent_createdAt_idx" ON "UserBehaviorEvent"("createdAt");

-- CreateIndex
CREATE INDEX "UserBehaviorEvent_sessionId_idx" ON "UserBehaviorEvent"("sessionId");

-- CreateIndex
CREATE INDEX "UserBehaviorEvent_userId_eventType_idx" ON "UserBehaviorEvent"("userId", "eventType");

-- CreateIndex
CREATE INDEX "UserChild_isActive_idx" ON "UserChild"("isActive");

-- CreateIndex
CREATE INDEX "UserChild_userId_idx" ON "UserChild"("userId");

-- CreateIndex
CREATE INDEX "UserComment_isActive_idx" ON "UserComment"("isActive");

-- CreateIndex
CREATE INDEX "UserComment_isModerated_idx" ON "UserComment"("isModerated");

-- CreateIndex
CREATE INDEX "UserComment_parentId_idx" ON "UserComment"("parentId");

-- CreateIndex
CREATE INDEX "UserComment_listingId_idx" ON "UserComment"("listingId");

-- CreateIndex
CREATE INDEX "UserComment_userId_idx" ON "UserComment"("userId");

-- CreateIndex
CREATE INDEX "UserCommentVote_commentId_idx" ON "UserCommentVote"("commentId");

-- CreateIndex
CREATE INDEX "UserCommentVote_userId_idx" ON "UserCommentVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommentVote_userId_commentId_key" ON "UserCommentVote"("userId", "commentId");

-- CreateIndex
CREATE INDEX "UserFavorite_listingId_idx" ON "UserFavorite"("listingId");

-- CreateIndex
CREATE INDEX "UserFavorite_userId_idx" ON "UserFavorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_listingId_key" ON "UserFavorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "UserInterest_interestId_idx" ON "UserInterest"("interestId");

-- CreateIndex
CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_interestId_key" ON "UserInterest"("userId", "interestId");

-- CreateIndex
CREATE INDEX "UserLoyaltyPoint_createdAt_idx" ON "UserLoyaltyPoint"("createdAt");

-- CreateIndex
CREATE INDEX "UserLoyaltyPoint_expiresAt_idx" ON "UserLoyaltyPoint"("expiresAt");

-- CreateIndex
CREATE INDEX "UserLoyaltyPoint_source_sourceId_idx" ON "UserLoyaltyPoint"("source", "sourceId");

-- CreateIndex
CREATE INDEX "UserLoyaltyPoint_userId_idx" ON "UserLoyaltyPoint"("userId");

-- CreateIndex
CREATE INDEX "UserNotification_createdAt_idx" ON "UserNotification"("createdAt");

-- CreateIndex
CREATE INDEX "UserNotification_type_idx" ON "UserNotification"("type");

-- CreateIndex
CREATE INDEX "UserNotification_isRead_idx" ON "UserNotification"("isRead");

-- CreateIndex
CREATE INDEX "UserNotification_userId_idx" ON "UserNotification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSettings_userId_key" ON "UserNotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "UserNotificationSettings_userId_idx" ON "UserNotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "UserReview_isActive_idx" ON "UserReview"("isActive");

-- CreateIndex
CREATE INDEX "UserReview_isModerated_idx" ON "UserReview"("isModerated");

-- CreateIndex
CREATE INDEX "UserReview_listingId_idx" ON "UserReview"("listingId");

-- CreateIndex
CREATE INDEX "UserReview_userId_idx" ON "UserReview"("userId");

-- CreateIndex
CREATE INDEX "UserReviewVote_reviewId_idx" ON "UserReviewVote"("reviewId");

-- CreateIndex
CREATE INDEX "UserReviewVote_userId_idx" ON "UserReviewVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReviewVote_userId_reviewId_key" ON "UserReviewVote"("userId", "reviewId");

-- CreateIndex
CREATE INDEX "UserSubscription_type_targetId_idx" ON "UserSubscription"("type", "targetId");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_type_targetId_key" ON "UserSubscription"("userId", "type", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_userId_key" ON "UserWallet"("userId");

-- CreateIndex
CREATE INDEX "UserWallet_userId_idx" ON "UserWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorOnboarding_vendorId_key" ON "VendorOnboarding"("vendorId");

-- CreateIndex
CREATE INDEX "VendorOnboarding_vendorId_isCompleted_idx" ON "VendorOnboarding"("vendorId", "isCompleted");

-- CreateIndex
CREATE INDEX "VendorPerformanceMetric_period_date_idx" ON "VendorPerformanceMetric"("period", "date");

-- CreateIndex
CREATE INDEX "VendorPerformanceMetric_vendorId_metricType_date_idx" ON "VendorPerformanceMetric"("vendorId", "metricType", "date");

-- CreateIndex
CREATE INDEX "VendorSubscription_vendorId_status_idx" ON "VendorSubscription"("vendorId", "status");

-- CreateIndex
CREATE INDEX "VendorTariffPlan_tariff_isActive_idx" ON "VendorTariffPlan"("tariff", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PopularCategory_cityId_name_key" ON "PopularCategory"("cityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AfishaEventPopularCategory_afishaEventId_popularCategoryId_key" ON "AfishaEventPopularCategory"("afishaEventId", "popularCategoryId");

-- CreateIndex
CREATE INDEX "EventReview_eventId_idx" ON "EventReview"("eventId");

-- CreateIndex
CREATE INDEX "EventReview_userId_idx" ON "EventReview"("userId");

-- CreateIndex
CREATE INDEX "EventReview_status_idx" ON "EventReview"("status");

-- CreateIndex
CREATE INDEX "EventReview_createdAt_idx" ON "EventReview"("createdAt");

-- CreateIndex
CREATE INDEX "VenueReview_venueId_idx" ON "VenueReview"("venueId");

-- CreateIndex
CREATE INDEX "VenueReview_userId_idx" ON "VenueReview"("userId");

-- CreateIndex
CREATE INDEX "VenueReview_status_idx" ON "VenueReview"("status");

-- CreateIndex
CREATE INDEX "VenueReview_createdAt_idx" ON "VenueReview"("createdAt");

-- CreateIndex
CREATE INDEX "ReviewReaction_reviewId_idx" ON "ReviewReaction"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewReaction_userId_idx" ON "ReviewReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReaction_reviewId_userId_key" ON "ReviewReaction"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "VenueReviewReaction_reviewId_idx" ON "VenueReviewReaction"("reviewId");

-- CreateIndex
CREATE INDEX "VenueReviewReaction_userId_idx" ON "VenueReviewReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueReviewReaction_reviewId_userId_key" ON "VenueReviewReaction"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "ReviewReply_reviewId_idx" ON "ReviewReply"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewReply_userId_idx" ON "ReviewReply"("userId");

-- CreateIndex
CREATE INDEX "ReviewReply_status_idx" ON "ReviewReply"("status");

-- CreateIndex
CREATE INDEX "ReviewReply_createdAt_idx" ON "ReviewReply"("createdAt");

-- CreateIndex
CREATE INDEX "VenueReviewReply_reviewId_idx" ON "VenueReviewReply"("reviewId");

-- CreateIndex
CREATE INDEX "VenueReviewReply_userId_idx" ON "VenueReviewReply"("userId");

-- CreateIndex
CREATE INDEX "VenueReviewReply_status_idx" ON "VenueReviewReply"("status");

-- CreateIndex
CREATE INDEX "VenueReviewReply_createdAt_idx" ON "VenueReviewReply"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPoints_userId_key" ON "UserPoints"("userId");

-- CreateIndex
CREATE INDEX "UserPoints_userId_idx" ON "UserPoints"("userId");

-- CreateIndex
CREATE INDEX "UserPoints_level_idx" ON "UserPoints"("level");

-- CreateIndex
CREATE INDEX "PointsTransaction_userId_idx" ON "PointsTransaction"("userId");

-- CreateIndex
CREATE INDEX "PointsTransaction_type_idx" ON "PointsTransaction"("type");

-- CreateIndex
CREATE INDEX "PointsTransaction_category_idx" ON "PointsTransaction"("category");

-- CreateIndex
CREATE INDEX "PointsTransaction_createdAt_idx" ON "PointsTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Reward_isActive_idx" ON "Reward"("isActive");

-- CreateIndex
CREATE INDEX "Reward_type_idx" ON "Reward"("type");

-- CreateIndex
CREATE INDEX "UserReward_userId_idx" ON "UserReward"("userId");

-- CreateIndex
CREATE INDEX "UserReward_rewardId_idx" ON "UserReward"("rewardId");

-- CreateIndex
CREATE INDEX "UserReward_isUsed_idx" ON "UserReward"("isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_inviteCode_key" ON "UserInvite"("inviteCode");

-- CreateIndex
CREATE INDEX "UserInvite_inviterId_idx" ON "UserInvite"("inviterId");

-- CreateIndex
CREATE INDEX "UserInvite_inviteeId_idx" ON "UserInvite"("inviteeId");

-- CreateIndex
CREATE INDEX "UserInvite_inviteCode_idx" ON "UserInvite"("inviteCode");

-- CreateIndex
CREATE INDEX "UserInvite_isUsed_idx" ON "UserInvite"("isUsed");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "VendorModerationHistory_vendorId_idx" ON "VendorModerationHistory"("vendorId");

-- CreateIndex
CREATE INDEX "VendorModerationHistory_action_idx" ON "VendorModerationHistory"("action");

-- CreateIndex
CREATE INDEX "VendorModerationHistory_createdAt_idx" ON "VendorModerationHistory"("createdAt");

-- CreateIndex
CREATE INDEX "VendorModerationHistory_moderatorId_idx" ON "VendorModerationHistory"("moderatorId");

-- CreateIndex
CREATE INDEX "EventView_eventId_idx" ON "EventView"("eventId");

-- CreateIndex
CREATE INDEX "EventView_ipAddress_idx" ON "EventView"("ipAddress");

-- CreateIndex
CREATE INDEX "EventView_createdAt_idx" ON "EventView"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventView_eventId_ipAddress_key" ON "EventView"("eventId", "ipAddress");

-- CreateIndex
CREATE INDEX "HeroSlot_city_idx" ON "HeroSlot"("city");

-- CreateIndex
CREATE INDEX "HeroSlot_isActive_idx" ON "HeroSlot"("isActive");

-- CreateIndex
CREATE INDEX "HeroSlot_startDate_endDate_idx" ON "HeroSlot"("startDate", "endDate");
