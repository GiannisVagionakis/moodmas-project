import type { GatsbyNode } from 'gatsby';

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ actions }) => {
    actions.setWebpackConfig({
        resolve: {
            fallback: {
                fs: false,
                path: false,
                crypto: false,
            },
        },
    });
};
