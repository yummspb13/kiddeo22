# Mobile & PWA Testing Checklist

## Device Testing Matrix

### Mobile Devices
- [ ] **iPhone SE (375x667)** - Small screen testing
- [ ] **iPhone 12/13/14 (390x844)** - Standard iPhone
- [ ] **iPhone 14 Pro Max (430x932)** - Large iPhone
- [ ] **Samsung Galaxy S21 (360x800)** - Android flagship
- [ ] **Google Pixel 6 (412x915)** - Stock Android
- [ ] **OnePlus 9 (412x915)** - Custom Android

### Tablets
- [ ] **iPad (768x1024)** - Portrait tablet
- [ ] **iPad Pro (834x1194)** - Large tablet
- [ ] **Samsung Galaxy Tab (800x1280)** - Android tablet
- [ ] **iPad Air (820x1180)** - Medium tablet

### Browsers
- [ ] **Safari iOS** - iOS WebKit
- [ ] **Chrome Android** - Chromium mobile
- [ ] **Firefox Android** - Gecko mobile
- [ ] **Samsung Internet** - Samsung browser
- [ ] **Edge Mobile** - Microsoft Edge

## Responsive Breakpoints Testing

### Mobile (320px - 767px)
- [ ] **320px** - Minimum mobile width
- [ ] **375px** - iPhone SE
- [ ] **390px** - iPhone 12/13/14
- [ ] **414px** - iPhone Plus
- [ ] **430px** - iPhone Pro Max
- [ ] **480px** - Large mobile
- [ ] **640px** - Small tablet portrait

### Tablet (768px - 1023px)
- [ ] **768px** - iPad portrait
- [ ] **800px** - Android tablet
- [ ] **820px** - iPad Air
- [ ] **834px** - iPad Pro
- [ ] **1024px** - iPad landscape

### Desktop (1024px+)
- [ ] **1024px** - Small desktop
- [ ] **1280px** - Standard desktop
- [ ] **1536px** - Large desktop
- [ ] **1920px** - Full HD

## Touch Interactions Testing

### Gestures
- [ ] **Tap** - Single finger tap
- [ ] **Double tap** - Double finger tap
- [ ] **Long press** - Press and hold
- [ ] **Swipe left/right** - Horizontal swipe
- [ ] **Swipe up/down** - Vertical swipe
- [ ] **Pinch to zoom** - Two finger zoom
- [ ] **Pull to refresh** - Pull down gesture

### Touch Targets
- [ ] **Minimum 44px** - All interactive elements
- [ ] **Adequate spacing** - Between touch targets
- [ ] **No overlap** - Touch targets don't overlap
- [ ] **Visual feedback** - Touch states visible

## PWA Features Testing

### Installation
- [ ] **Install prompt** - Shows on supported browsers
- [ ] **Add to home screen** - iOS Safari
- [ ] **Install button** - Chrome/Edge
- [ ] **App shortcuts** - Quick actions work
- [ ] **Splash screen** - Shows on launch

### Offline Functionality
- [ ] **Offline indicator** - Shows when offline
- [ ] **Cached content** - Loads from cache
- [ ] **Offline page** - Shows when no cache
- [ ] **Background sync** - Syncs when online
- [ ] **Retry mechanism** - Failed requests retry

### Push Notifications
- [ ] **Permission request** - Shows permission dialog
- [ ] **Subscription** - Successfully subscribes
- [ ] **Notification display** - Shows notifications
- [ ] **Action buttons** - Notification actions work
- [ ] **Click handling** - Opens correct page

## Performance Testing

### Web Vitals Targets
- [ ] **LCP < 2.5s** - Largest Contentful Paint
- [ ] **FID < 100ms** - First Input Delay
- [ ] **CLS < 0.1** - Cumulative Layout Shift
- [ ] **FCP < 1.8s** - First Contentful Paint
- [ ] **TTI < 3.8s** - Time to Interactive

### Network Conditions
- [ ] **3G Slow** - 400ms RTT, 400kbps
- [ ] **3G Fast** - 300ms RTT, 1.6Mbps
- [ ] **4G** - 150ms RTT, 4Mbps
- [ ] **WiFi** - 20ms RTT, 30Mbps

### Device Performance
- [ ] **Low-end device** - 4x CPU slowdown
- [ ] **Mid-range device** - 2x CPU slowdown
- [ ] **High-end device** - Normal performance

## Accessibility Testing

### Screen Readers
- [ ] **VoiceOver (iOS)** - Apple screen reader
- [ ] **TalkBack (Android)** - Google screen reader
- [ ] **NVDA (Desktop)** - Windows screen reader
- [ ] **JAWS (Desktop)** - Windows screen reader

### Keyboard Navigation
- [ ] **Tab order** - Logical tab sequence
- [ ] **Focus indicators** - Visible focus states
- [ ] **Skip links** - Skip to main content
- [ ] **Keyboard shortcuts** - Common shortcuts work

### Visual Accessibility
- [ ] **Color contrast** - WCAG AA compliance
- [ ] **Text scaling** - 200% zoom works
- [ ] **High contrast** - High contrast mode
- [ ] **Color blindness** - Color not only indicator

## Feature-Specific Testing

### Navigation
- [ ] **Header** - Responsive header works
- [ ] **Bottom navigation** - Mobile bottom nav
- [ ] **Hamburger menu** - Mobile drawer menu
- [ ] **Breadcrumbs** - Navigation breadcrumbs

### Content
- [ ] **Carousels** - Touch swipe works
- [ ] **Cards** - Responsive card layouts
- [ ] **Forms** - Mobile-friendly forms
- [ ] **Modals** - Mobile modal behavior

### E-commerce
- [ ] **Product pages** - Mobile product view
- [ ] **Shopping cart** - Mobile cart interface
- [ ] **Checkout** - Mobile checkout flow
- [ ] **Payment** - Mobile payment forms

## Browser-Specific Testing

### Safari iOS
- [ ] **Viewport handling** - Proper viewport meta
- [ ] **Touch events** - Touch event handling
- [ ] **Scroll behavior** - Smooth scrolling
- [ ] **Safe areas** - Notch handling
- [ ] **PWA installation** - Add to home screen

### Chrome Android
- [ ] **PWA installation** - Install prompt
- [ ] **Push notifications** - Notification handling
- [ ] **Background sync** - Background sync
- [ ] **Service worker** - SW registration

### Firefox Android
- [ ] **PWA features** - Limited PWA support
- [ ] **Touch events** - Touch handling
- [ ] **Performance** - Rendering performance

## Edge Cases

### Orientation Changes
- [ ] **Portrait to landscape** - Layout adaptation
- [ ] **Landscape to portrait** - Layout adaptation
- [ ] **Rotation during interaction** - State preservation

### Network Changes
- [ ] **Online to offline** - Offline mode activation
- [ ] **Offline to online** - Online mode restoration
- [ ] **Slow to fast** - Performance improvement

### Memory Constraints
- [ ] **Low memory** - App doesn't crash
- [ ] **Background tabs** - Proper cleanup
- [ ] **Image loading** - Lazy loading works

## Testing Tools

### Automated Testing
- [ ] **Lighthouse CI** - Automated performance testing
- [ ] **Playwright** - Cross-browser testing
- [ ] **Cypress** - E2E testing
- [ ] **Jest** - Unit testing

### Manual Testing
- [ ] **Device testing** - Physical device testing
- [ ] **User testing** - Real user testing
- [ ] **Accessibility testing** - Manual a11y testing
- [ ] **Performance testing** - Manual performance testing

## Bug Tracking

### Critical Issues
- [ ] **App crashes** - No crashes on any device
- [ ] **Data loss** - No data loss scenarios
- [ ] **Security issues** - No security vulnerabilities
- [ ] **Performance issues** - No major performance problems

### Minor Issues
- [ ] **Visual glitches** - Minor visual issues
- [ ] **UX improvements** - User experience enhancements
- [ ] **Performance optimizations** - Minor performance improvements
- [ ] **Accessibility improvements** - A11y enhancements

## Sign-off

### Testing Complete
- [ ] **All tests passed** - All checklist items completed
- [ ] **No critical bugs** - No critical issues found
- [ ] **Performance targets met** - All performance targets achieved
- [ ] **Accessibility compliant** - WCAG AA compliance achieved

### Approval
- [ ] **QA Lead approval** - QA team approval
- [ ] **Product approval** - Product team approval
- [ ] **Design approval** - Design team approval
- [ ] **Ready for production** - Production ready
