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

const noop = () => null;

const compile = (partials, render, parent) => {
    const result = {};

    for (const key in partials) {
        result[key] = () => render(key);
    }

    const pmap = parent && parent.mappings;
    if (pmap) {
        for (const key in pmap) {
            if (!result[key]) {
                result[key] = () => render(key);
            }
        }
    }

    return result;
}

const hasPartial = ({ partials }, key) => typeof partials[key] === 'function';

const lookup = (scene, key) => scene && (
    hasPartial(scene, key) ? scene : lookup(scene.parent, key)
);

const renderPartial = ({ partials, parent }, key, mappings) => (
    partials[key](mappings, parent && parent.mappings[key] || noop)
);

const renderScene = (scene, key = 'render') => {
    const target = lookup(scene, key);
    return target && renderPartial(target, key, scene.mappings);
}

const decorate = ({ partials, parent }, root) => (
    new Scene(partials, parent ? decorate(parent, root) : root)
);

module.exports = (parent, partials) => (
    partials ? new Scene(partials, parent) : new Scene(parent)
);
