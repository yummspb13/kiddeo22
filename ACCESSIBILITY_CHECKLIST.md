# Accessibility Testing Checklist

## WCAG 2.1 AA Compliance

### Perceivable
- [ ] **Text alternatives**: All images have alt text
- [ ] **Captions**: Videos have captions
- [ ] **Audio descriptions**: Audio content has descriptions
- [ ] **Adaptable content**: Content can be presented in different ways
- [ ] **Distinguishable**: Easy to see and hear content

### Operable
- [ ] **Keyboard accessible**: All functionality available via keyboard
- [ ] **No seizures**: No content that causes seizures
- [ ] **Navigable**: Easy to navigate and find content
- [ ] **Input assistance**: Help users avoid and correct mistakes

### Understandable
- [ ] **Readable**: Text is readable and understandable
- [ ] **Predictable**: Web pages appear and operate in predictable ways
- [ ] **Input assistance**: Help users avoid and correct mistakes

### Robust
- [ ] **Compatible**: Compatible with assistive technologies
- [ ] **Future-proof**: Works with current and future technologies

## Screen Reader Testing

### VoiceOver (iOS)
- [ ] **Navigation**: Can navigate through all content
- [ ] **Headings**: Proper heading structure announced
- [ ] **Links**: Link text is descriptive
- [ ] **Buttons**: Button labels are clear
- [ ] **Forms**: Form labels are properly associated
- [ ] **Images**: Alt text is read correctly
- [ ] **Tables**: Table structure is announced
- [ ] **Lists**: List items are properly identified

### TalkBack (Android)
- [ ] **Navigation**: Can navigate through all content
- [ ] **Headings**: Proper heading structure announced
- [ ] **Links**: Link text is descriptive
- [ ] **Buttons**: Button labels are clear
- [ ] **Forms**: Form labels are properly associated
- [ ] **Images**: Alt text is read correctly
- [ ] **Tables**: Table structure is announced
- [ ] **Lists**: List items are properly identified

### NVDA (Windows)
- [ ] **Navigation**: Can navigate through all content
- [ ] **Headings**: Proper heading structure announced
- [ ] **Links**: Link text is descriptive
- [ ] **Buttons**: Button labels are clear
- [ ] **Forms**: Form labels are properly associated
- [ ] **Images**: Alt text is read correctly
- [ ] **Tables**: Table structure is announced
- [ ] **Lists**: List items are properly identified

### JAWS (Windows)
- [ ] **Navigation**: Can navigate through all content
- [ ] **Headings**: Proper heading structure announced
- [ ] **Links**: Link text is descriptive
- [ ] **Buttons**: Button labels are clear
- [ ] **Forms**: Form labels are properly associated
- [ ] **Images**: Alt text is read correctly
- [ ] **Tables**: Table structure is announced
- [ ] **Lists**: List items are properly identified

## Keyboard Navigation

### Tab Order
- [ ] **Logical sequence**: Tab order follows logical flow
- [ ] **Skip links**: Skip to main content available
- [ ] **Focus indicators**: Clear visual focus indicators
- [ ] **No keyboard traps**: Can navigate away from all elements
- [ ] **All interactive elements**: All buttons, links, form controls accessible

### Keyboard Shortcuts
- [ ] **Common shortcuts**: Standard shortcuts work (Ctrl+A, Ctrl+C, etc.)
- [ ] **Custom shortcuts**: App-specific shortcuts documented
- [ ] **Shortcut conflicts**: No conflicting shortcuts
- [ ] **Shortcut help**: Help available for shortcuts

### Focus Management
- [ ] **Focus visible**: Focus indicators are visible
- [ ] **Focus persistence**: Focus maintained during interactions
- [ ] **Focus restoration**: Focus restored after modal close
- [ ] **Focus order**: Focus follows logical order

## Visual Accessibility

### Color Contrast
- [ ] **Normal text**: 4.5:1 contrast ratio minimum
- [ ] **Large text**: 3:1 contrast ratio minimum
- [ ] **UI components**: 3:1 contrast ratio minimum
- [ ] **Graphical objects**: 3:1 contrast ratio minimum
- [ ] **Color blindness**: Information not conveyed by color alone

### Text Scaling
- [ ] **200% zoom**: Content remains usable at 200% zoom
- [ ] **Text scaling**: Text scales properly with browser zoom
- [ ] **Layout preservation**: Layout doesn't break at high zoom
- [ ] **Content visibility**: All content remains visible

### High Contrast Mode
- [ ] **High contrast**: Works in high contrast mode
- [ ] **Color scheme**: Respects system color scheme
- [ ] **Text visibility**: Text remains visible
- [ ] **Interactive elements**: Buttons and links remain visible

## Motor Accessibility

### Touch Targets
- [ ] **Minimum size**: 44x44px minimum touch target size
- [ ] **Adequate spacing**: 8px minimum spacing between targets
- [ ] **No overlap**: Touch targets don't overlap
- [ ] **Visual feedback**: Touch states provide feedback

### Gesture Alternatives
- [ ] **Swipe alternatives**: Button alternatives for swipe gestures
- [ ] **Pinch alternatives**: Button alternatives for pinch gestures
- [ ] **Long press alternatives**: Button alternatives for long press
- [ ] **Drag alternatives**: Button alternatives for drag gestures

### Timing
- [ ] **No time limits**: No content with time limits
- [ ] **Adjustable timing**: Time limits can be adjusted
- [ ] **Pause functionality**: Moving content can be paused
- [ ] **Stop functionality**: Auto-playing content can be stopped

## Cognitive Accessibility

### Content Structure
- [ ] **Clear headings**: Descriptive and hierarchical headings
- [ ] **Logical flow**: Content flows in logical order
- [ ] **Consistent navigation**: Navigation is consistent
- [ ] **Clear language**: Simple and clear language used

### Error Prevention
- [ ] **Clear instructions**: Instructions are clear and helpful
- [ ] **Error messages**: Error messages are descriptive
- [ ] **Input validation**: Real-time validation with helpful messages
- [ ] **Confirmation dialogs**: Destructive actions require confirmation

### Memory Aids
- [ ] **Breadcrumbs**: Navigation breadcrumbs provided
- [ ] **Progress indicators**: Progress through multi-step processes
- [ ] **Save functionality**: Ability to save progress
- [ ] **Undo functionality**: Ability to undo actions

## Mobile Accessibility

### Touch Accessibility
- [ ] **Touch targets**: Adequate touch target sizes
- [ ] **Touch feedback**: Visual feedback for touch interactions
- [ ] **Gesture alternatives**: Button alternatives for gestures
- [ ] **Orientation support**: Works in both portrait and landscape

### Screen Reader Support
- [ ] **Mobile screen readers**: Works with mobile screen readers
- [ ] **Voice control**: Works with voice control
- [ ] **Switch control**: Works with switch control
- [ ] **Assistive touch**: Works with assistive touch

### Mobile-Specific Features
- [ ] **Dynamic type**: Respects system font size settings
- [ ] **Reduce motion**: Respects reduce motion preferences
- [ ] **High contrast**: Works with high contrast mode
- [ ] **Invert colors**: Works with invert colors

## PWA Accessibility

### App Installation
- [ ] **Install prompts**: Accessible install prompts
- [ ] **App shortcuts**: Accessible app shortcuts
- [ ] **Splash screen**: Accessible splash screen
- [ ] **App manifest**: Proper manifest configuration

### Offline Functionality
- [ ] **Offline indicators**: Clear offline status indicators
- [ ] **Offline content**: Accessible offline content
- [ ] **Sync status**: Clear sync status indicators
- [ ] **Error handling**: Accessible error messages

### Push Notifications
- [ ] **Permission requests**: Accessible permission requests
- [ ] **Notification content**: Accessible notification content
- [ ] **Notification actions**: Accessible notification actions
- [ ] **Settings**: Accessible notification settings

## Testing Tools

### Automated Testing
- [ ] **axe-core**: Automated accessibility testing
- [ ] **Lighthouse**: Accessibility audit
- [ ] **WAVE**: Web accessibility evaluation
- [ ] **Pa11y**: Command line accessibility testing

### Manual Testing
- [ ] **Screen reader testing**: Manual screen reader testing
- [ ] **Keyboard testing**: Manual keyboard navigation testing
- [ ] **Visual testing**: Manual visual accessibility testing
- [ ] **User testing**: Testing with real users with disabilities

### Browser Extensions
- [ ] **axe DevTools**: Chrome extension for accessibility testing
- [ ] **WAVE**: Web accessibility evaluation tool
- [ ] **Color Contrast Analyzer**: Color contrast testing
- [ ] **Accessibility Insights**: Microsoft accessibility testing tool

## Common Issues to Check

### Images
- [ ] **Alt text**: All images have descriptive alt text
- [ ] **Decorative images**: Decorative images have empty alt text
- [ ] **Complex images**: Complex images have detailed descriptions
- [ ] **Image maps**: Image maps have proper alt text

### Forms
- [ ] **Labels**: All form controls have labels
- [ ] **Fieldsets**: Related form controls grouped with fieldsets
- [ ] **Error messages**: Error messages are associated with controls
- [ ] **Required fields**: Required fields are clearly marked

### Tables
- [ ] **Headers**: Table headers are properly marked
- [ ] **Scope**: Header scope is properly defined
- [ ] **Caption**: Tables have descriptive captions
- [ ] **Summary**: Complex tables have summaries

### Links
- [ ] **Descriptive text**: Link text describes the destination
- [ ] **Context**: Link context is clear
- [ ] **Underlined**: Links are visually distinct
- [ ] **Focus**: Links have visible focus indicators

### Headings
- [ ] **Hierarchy**: Heading hierarchy is logical
- [ ] **Descriptive**: Headings are descriptive
- [ ] **Consistent**: Heading styles are consistent
- [ ] **Skip levels**: No skipped heading levels

## Accessibility Statement

### Public Statement
- [ ] **Accessibility statement**: Public accessibility statement available
- [ ] **Contact information**: Contact information for accessibility issues
- [ ] **Compliance level**: WCAG compliance level stated
- [ ] **Testing methods**: Testing methods described

### Internal Documentation
- [ ] **Accessibility guidelines**: Internal accessibility guidelines
- [ ] **Testing procedures**: Accessibility testing procedures
- [ ] **Training materials**: Accessibility training materials
- [ ] **Review process**: Regular accessibility review process

## Sign-off

### Testing Complete
- [ ] **All tests passed**: All accessibility tests completed
- [ ] **WCAG AA compliant**: Meets WCAG 2.1 AA standards
- [ ] **Screen reader tested**: Tested with multiple screen readers
- [ ] **Keyboard tested**: Tested with keyboard navigation

### Approval
- [ ] **Accessibility expert approval**: Accessibility expert approval
- [ ] **User testing approval**: User testing with disabled users
- [ ] **Legal compliance**: Legal accessibility compliance
- [ ] **Ready for production**: Production ready for all users
