module.exports = {
    site: {
        title: "tangxinfa's blog",
        description: '记我所思，忆我所为。',
        link: 'http://tangxinfa.github.io',
        image: 'http://tangxinfa.github.io/static/favicon.ico',
        copyright: '版权所有 © 2011-2020 tangxinfa',
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
