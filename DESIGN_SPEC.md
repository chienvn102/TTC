# Design Specification: Trung tâm CNTT App

## Overview
React Native app để quản lý bookmarks website và nhận thông báo nhắc việc.

---

## Screens

### 1. HomeScreen (Trang chủ)

**Layout:**
- Header: Logo/Title + Nút thêm (+)
- Content: List websites dạng card
- Bottom: Tab navigation

**Card Website:**
- Icon tròn (chữ cái đầu hoặc favicon)
- Tên website
- URL (truncated)
- Nút xóa (optional)

**Actions:**
- Tap card → Mở WebView
- Long press → Sửa
- Tap + → Modal thêm mới

---

### 2. NotificationsScreen (Thông báo)

**Layout:**
- Header: "Thông báo" + Badge số lượng
- Content: List thông báo (pull-to-refresh)

**Card Thông báo:**
- Title (2 dòng max)
- Hạn hoàn thành (date/time)
- Thời gian nhắc (date/time)
- Tag "Quá hạn" nếu đã qua deadline

**Actions:**
- Tap card → NotificationDetailScreen
- Pull down → Refresh từ API

---

### 3. NotificationDetailScreen (Chi tiết)

**Layout:**
- Header: Nút back + "Chi tiết"
- Card thông tin:
  - Title (lớn)
  - Trạng thái quá hạn (nếu có)
  - Hạn hoàn thành
  - Thời gian nhắc
  - Link (nếu có)
- Buttons:
  - "Mở trang web" (primary)
  - "Đặt nhắc nhở" (secondary)

---

### 4. WebViewScreen

**Layout:**
- Header: Nút back + Title trang
- WebView full screen
- Loading indicator

---

### 5. AddAppModal

**Fields:**
- Input: Tên website
- Input: URL
- Buttons: Hủy | Lưu

---

## Navigation

```
Bottom Tabs
├── Trang chủ (HomeScreen)
└── Thông báo (NotificationsScreen)

Stack (từ tabs)
├── WebViewScreen
└── NotificationDetailScreen
```

---

## Colors

| Element | Hex |
|---------|-----|
| Primary (header, buttons) | #2B5C7E |
| Accent (add button, badges) | #F5A623 |
| Background | #F5F5F5 |
| Card background | #FFFFFF |
| Text primary | #333333 |
| Text secondary | #888888 |
| Error/Overdue | #E55555 |
| Border | #E0E0E0 |

---

## Typography

| Element | Size | Weight |
|---------|------|--------|
| Header title | 20px | Bold |
| Card title | 15px | SemiBold |
| Body text | 13-14px | Regular |
| Label | 12px | Regular |
| Button text | 15px | SemiBold |

---

## Spacing

- Padding container: 16px
- Card padding: 14px
- Card margin bottom: 10px
- Border radius: 8px
- Button radius: 8px

---

## Components

### Card Website
```
┌────────────────────────────────────┐
│ [W]  Trung tâm CNTT          [X]  │
│      trungtamcntt.bn1.vn          │
└────────────────────────────────────┘
```

### Card Notification
```
┌────────────────────────────────────┐
│ Test nhắc việc - tiêu đề          │
│                                    │
│ Hạn:  22/01 12:00    [Quá hạn]    │
│ Nhắc: 21/01 21:00                 │
└────────────────────────────────────┘
```

### Bottom Tab
```
┌─────────────────┬─────────────────┐
│    Trang chủ    │    Thông báo    │
└─────────────────┴─────────────────┘
```

---

## Notes for Designer

1. **Đơn giản** - Không dùng emoji, icon đơn giản
2. **Mobile-first** - Tối ưu cho điện thoại
3. **Vietnamese** - Tất cả text tiếng Việt
4. **Responsive** - Hoạt động trên nhiều kích thước màn hình
