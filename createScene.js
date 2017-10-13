class Scene {
    constructor(partials, parent) {
        const render = renderScene.bind(undefined, this);

        this.mappings = compile(partials, render, parent)
        this.partials = partials || null;
        this.parent = parent || null;
        this.render = render;
    }

    decorate(parent) {
        return decorate(this, parent);
    }
}

const stack = { base: null };

const pushStack = (scene, key) => {
    let item = stack.base;
    while (item) {
        if (item.scene === scene && item.key === key) {
            return false;
        }
        item = item.next;
    }
    stack.base = { scene, key, next: stack.base };
    return true;
};

const popStack = () => {
    stack.base = stack.base.next;
};

const noop = () => null;

const compile = (partials, render, parent) => {
    const mappings = {};

    for (const key in partials) {
        mappings[key] = () => render(key);
    }

    const pmap = parent && parent.mappings;
    if (pmap) {
        for (const key in pmap) {
            if (!mappings[key]) {
                mappings[key] = () => render(key);
            }
        }
    }

    return mappings;
}

const hasPartial = ({ partials }, key) => typeof partials[key] === 'function';

const lookup = (scene, key) => scene && (
    hasPartial(scene, key) ? scene : lookup(scene.parent, key)
);

const renderScene = (scene, key = 'render') => {
    const target = lookup(scene, key);

    if (target) {
        if (!pushStack(scene, key)) {
            const from = stack.base.key;
            stack.base = null;
            throw new Error(`Scene render recursion from [${from}] partial`);
        }

        const { partials: { [key]: partial }, parent } = target;
        const { mappings } = scene;
        const result = partial(mappings, parent && parent.mappings[key] || noop);

        popStack();

        return result;
    }

    return null;
}

const decorate = ({ partials, parent }, root) => (
    new Scene(partials, parent ? decorate(parent, root) : root)
);

module.exports = (parent, partials) => (
    partials ? new Scene(partials, parent) : new Scene(parent)
);
