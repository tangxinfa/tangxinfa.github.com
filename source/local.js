module.exports = {
    site: {
        title: '看看俺 – KanKanAn.com',
        description: '记我所思，忆我所为。',
        link: 'http://blog.kankanan.com',
        image: 'http://blog.kankanan.com/static/favicon.ico',
        copyright: '版权所有 © 2011-2018 看看俺 – KanKanAn.com',
        lang: 'zh-cn',
        home: '/category/tech/0.html',
        tags: {
            "轻断食": {
                slug: "the-fast-diet"
            }
        },
        categories: {
            ediary: {
                default: false,
                featured: false
            },
            "技术": {
                featured: true,
                default: true,
                slug: "tech",
                tags: []
            },
        }
    },
    author: {
        name: 'tangxinfa',
        email: 'tangxinfa@gmail.com',
        link: 'https://cn.linkedin.com/in/tangxinfa'
    },
    disqus: {
        shortname: 'kankananblog'
    },
};
