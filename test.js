const createScene = require('./createScene');

const baseScene = createScene({
    render: ({ Layout }) => Layout(),

    Layout: ({ Navigation, Content }) => {
        const nav = Navigation();
        const con = Content();
        return [
            'Layout',
            ...(nav ? [nav] : []),
            ...(con ? [con] : [])
        ];
    },
    
    Navigation: ({ NavigationItem }) => {
        const item = NavigationItem();
        return ['Navigation', ...(item ? [item] : [])]
    },

    NavigationItem: null,

    Content: null
});

const navItem1 = createScene(baseScene, {
    NavigationItem: (_, next) => {
        return ['NavItem 1', ...(next() || [])];
    }
});

const navItem2 = createScene(baseScene, {
    NavigationItem: (_, next) => {
        return ['NavItem 2', ...(next() || [])];
    }
})

const navItem3 = createScene(baseScene, {
    NavigationItem: (_, next) => {
        return ['NavItem 3', ...(next() || [])];
    }
})

const mainScene = navItem1.decorate(navItem2).decorate(navItem3);

const firstPage = createScene(mainScene, {
    Content: () => ['First page']
});

const secondPage = createScene(mainScene, {
    Content: () => ['Second page']
});

console.log(firstPage.render());
console.log(secondPage.render());
