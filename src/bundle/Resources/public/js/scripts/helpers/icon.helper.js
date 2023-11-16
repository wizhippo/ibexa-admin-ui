import { getContext as getHelpersContext } from './helpers.service';

const getIconPath = (path, iconSet) => {
    if (!iconSet) {
        iconSet = getHelpersContext().iconPaths.defaultIconSet;
    }

    const iconSetPath = getHelpersContext().iconPaths.iconSets[iconSet];
    return `${iconSetPath}#${path}`;
};

export { getIconPath };
