const {
    description
} = require('../package')

module.exports = {
    title: 'Sau khi cài đặt OpenCore',
    head: [
        ['meta', {
            name: 'theme-color',
            content: '#3eaf7c'
        }],
        ['meta', {
            name: 'apple-mobile-web-app-capable',
            content: 'yes'
        }],
        ['meta', {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black'
        }],
        ["link", {
            rel: "'stylesheet",
            href: "/styles/website.css"
        },]
    ],
    base: '/Sau-khi-Cai-dat-OpenCore/',

    watch: {
        $page(newPage, oldPage) {
            if (newPage.key !== oldPage.key) {
                requestAnimationFrame(() => {
                    if (this.$route.hash) {
                        const element = document.getElementById(this.$route.hash.slice(1));

                        if (element && element.scrollIntoView) {
                            element.scrollIntoView();
                        }
                    }
                });
            }
        }
    },

    markdown: {
        extendMarkdown: md => {
            md.use(require('markdown-it-multimd-table'), {
                rowspan: true,
            });
        }
    },

    theme: 'vuepress-theme-succinct',
    globalUIComponents: [
        'ThemeManager'
    ],

    themeConfig: {
        lastUpdated: false,
        repo: 'https://github.com/dortania/OpenCore-Post-Install',
        editLinks: true,
        editLinkText: 'Cùng giúp chúng mình cải thiện trang này!',
        logo: '/homepage.png',
        nav: [{
            text: 'Sách hướng dẫn từ Dortania',
            items: [{
                text: 'Trang chủ Dortania',
                link: 'https://dortania.github.io/'
            },
            {
                text: 'Hướng dẫn cài đặt OpenCore',
                link: 'https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/'
            },
            {
                text: 'Đa khởi động OpenCore',
                link: 'https://baokhanhwithfriends.github.io/Da-khoi-dong-OpenCore/'
            },
            {
                text: 'Khởi đầu với ACPI',
                link: 'https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/'
            },
            {
                text: 'Hướng dẫn chọn mua card màn hình',
                link: 'https://baokhanhwithfriends.github.io/Huong-dan-chon-mua-card-man-hinh/'
            },
            {
                text: 'Hướng dẫn chọn mua card mạng không dây',
                link: 'https://baokhanhwithfriends.github.io/Huong-dan-chon-mua-card-mang-khong-day/'
            },
            {
                text: 'Hướng dẫn tránh mua lầm phần cứng "khắc tinh"',
                link: 'https://baokhanhwithfriends.github.io/Huong-dan-tranh-mua-lam-phan-cung-khac-tinh-voi-Hackintosh/'
            },
            ]
        },],
        sidebar: [{
            title: 'Phần giới thiệu',
            collapsable: false,
            sidebarDepth: 1,
            children: [
                '',
            ]

        },
        {
            title: 'Các chức năng cơ bản',
            collapsable: false,
            sidebarDepth: 2,
            children: [

                ['/universal/audio', 'Sửa lỗi âm thanh'],
                ['/universal/oc2hdd', 'Khởi động không cần USB'],
                ['/universal/update', 'Cập nhật OpenCore, kexts và macOS'],
                ['/universal/drm', 'Sửa lỗi quản lý bản quyền số (DRM)'],
                ['/universal/iservices', 'Sửa mấy cái ứng dụng dịch vụ của Apple không xài được'],
                ['/universal/pm', 'Sửa lỗi điều phối điện năng nâng cao'],
                ['/universal/sleep', 'Sửa chế độ ngủ không hoạt động'],
            ]
        },
        {
            title: 'Sửa lỗi USB',
            collapsable: false,
            sidebarDepth: 1,
            children: [
                ['/usb/', 'Lập sơ đồ cổng USB: Phần giới thiệu'],
                ['/usb/system-preparation', 'Chuẩn bị hệ thống'],
                {
                    title: 'Bắt đầu lập sơ đồ cổng USB',
                    collapsable: true,
                    sidebarDepth: 2,
                    children: [
                        ['/usb/intel-mapping/intel', 'Lập sơ đồ cổng USB cho máy Intel'],
                        ['/usb/manual/manual', 'Lập sơ đồ cổng USB thủ công'],
                    ]
                },
                {
                    title: 'Sửa mấy lỗi lặt vặt liên quan tới USB',
                    collapsable: true,
                    sidebarDepth: 1,
                    children: [
                        ['/usb/misc/power', 'Sửa cấp nguồn USB không đúng điện áp'],
                        ['/usb/misc/shutdown', 'Sửa lỗi không tắt máy/khởi động lại được'],
                        ['/usb/misc/instant-wake', 'Sửa lỗi dậy tức thì khi mới ngủ'],
                        ['/usb/misc/keyboard', 'Sửa lỗi không đánh thức máy được bằng bàn phím'],
                    ]
                },
            ]
        },
        {
            title: 'Cải thiện Bảo mật',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                ['/universal/security', 'Bảo mật và Mã hóa ổ cứng bằng FileVault'],
                {
                    title: '',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: [
                        ['/universal/security/filevault', 'FileVault (Mã hoá ổ cứng)'],
                        ['/universal/security/vault', 'Vault (Niêm phong hệ thống)'],
                        ['/universal/security/scanpolicy', 'ScanPolicy (Chính sách quét ổ đĩa)'],
                        ['/universal/security/password', 'Menu mật khẩu OpenCore'],
                        ['/universal/security/applesecureboot', 'Tính năng Khởi động an toàn của Apple'],
                    ]
                },
            ]
        },
        {
            title: 'Dành riêng cho laptop',
            collapsable: false,
            children: [
                ['/laptop-specific/battery', 'Sửa lỗi hiển thị Thông số Pin'],

            ]
        },
        {
            title: 'Làm đẹp/Giao diện',
            collapsable: false,
            children: [
                ['/cosmetic/verbose', 'Sửa độ phân giải không đúng và tắt màn hình dòng lệnh chạy chữ'],
                ['/cosmetic/gui', 'Thêm giao diện và âm thanh khởi động'],
                ['/universal/memory', 'Sửa lỗi bộ nhớ khi xài SMBIOS MacPro7,1'],
            ]
        },
        {
            title: 'Chạy nhiều hệ điều hành',
            collapsable: false,
            children: [
                ['https://dortania.github.io/OpenCore-Multiboot/', 'Đa khởi động với OpenCore'],
                ['/multiboot/bootstrap', 'Thiết lập tùy chọn trình khởi chạy LauncherOption'],
                ['/multiboot/bootcamp', 'Cài đặt BootCamp'],
            ]
        },
        {
            title: 'Linh tinh lang tang',
            collapsable: false,
            children: [
                ['/misc/rtc', 'Sửa lỗi ghi dữ liệu RTC/CMOS'],
                ['/misc/msr-lock', 'Sửa lỗi khóa cấu hình CFG Lock (Mở khóa thanh ghi MSR 0xE2)'],
                ['/misc/nvram', 'Giả lập bộ nhớ NVRAM'],
            ]
        },
        {
            title: 'Vá lỗi card màn hình',
            collapsable: false,
            children: [
                ['/gpu-patching/', 'Vá lỗi card màn hình chuyên sâu'],
                {
                    title: 'Vá lỗi cho card màn hình onboard Intel (đời mới)',
                    collapsable: false,
                    children: [
                        ['/gpu-patching/intel-patching/', 'Sửa lỗi iGPU nâng cao'],
                        ['/gpu-patching/intel-patching/vram', 'Vá lỗi bộ nhớ VRAM'],
                        ['/gpu-patching/intel-patching/connector', 'Vá chuẩn kết nối màn hình'],
                        ['/gpu-patching/intel-patching/busid', 'Vá lỗi không xuất được hình nâng cao (vá BusID)'],
                    ]
                },
                {
                    title: 'Vá lỗi cho card màn hình onboard Intel (đời siêu... cũ)',
                    collapsable: false,
                    children: [
                        ['/gpu-patching/legacy-intel/', 'Cách vá lỗi cho onboard GMA'],
                    ]
                },
                {
                    title: 'Vá lỗi cho card màn hình Nvidia (đời siêu... cũ)',
                    collapsable: false,
                    children: [
                        ['/gpu-patching/nvidia-patching/', 'Cách vá lỗi cho card màn hình Nvidia đời cũ'],
                    ]
                },
            ]
        },

        ],
    },
    plugins: [
        '@vuepress/back-to-top',
        'vuepress-plugin-smooth-scroll',
        'vuepress-plugin-fulltext-search',
        ['@vuepress/medium-zoom',
            {
                selector: ".theme-succinct-content :not(a) > img",
                options: {
                    background: 'var(--bodyBgColor)'
                }
            }],
    ]
}