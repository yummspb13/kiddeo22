-- CreateIndex
CREATE INDEX "AfishaEvent_endDate_perf_idx" ON "AfishaEvent"("endDate");

-- CreateIndex
CREATE INDEX "AfishaEvent_city_perf_idx" ON "AfishaEvent"("city");

-- CreateIndex
CREATE INDEX "AfishaEvent_categoryId_perf_idx" ON "AfishaEvent"("categoryId");

-- CreateIndex
CREATE INDEX "City_isPublic_idx" ON "City"("isPublic");

-- CreateIndex
CREATE INDEX "City_slug_idx" ON "City"("slug");

-- CreateIndex
CREATE INDEX "VenuePartner_cityId_status_idx" ON "VenuePartner"("cityId", "status");

-- CreateIndex
CREATE INDEX "VenuePartner_slug_cityId_idx" ON "VenuePartner"("slug", "cityId");

-- CreateIndex
CREATE INDEX "VenuePartner_tariff_idx" ON "VenuePartner"("tariff");

-- RedefineIndex
DROP INDEX "AfishaEvent_startDate_idx";
CREATE INDEX "AfishaEvent_startDate_perf_idx" ON "AfishaEvent"("startDate");

-- RedefineIndex
DROP INDEX "AfishaEvent_status_citySlug_idx";
CREATE INDEX "AfishaEvent_status_citySlug_perf_idx" ON "AfishaEvent"("status", "citySlug");
