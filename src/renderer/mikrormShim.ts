/**
 * Pass through decorators
 */
const passthrough = () => () => {};

export const Entity = passthrough;
export const PrimaryKey = passthrough;
export const OneToMany = passthrough;
export const ManyToOne = passthrough;
export const Property = passthrough;
export const Collection = passthrough;
export const QueryOrder = passthrough;

export const MikroORM = {
  init: () =>
    console.warn('MikroORM has been stubbed out as it does not work in browser.'),
};
