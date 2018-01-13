import * as _ from 'lodash';

export function performActionsOneByOne (actions) {
    return _.reduce(actions, (promise, action) => {
        return promise.then(action)
    }, Promise.resolve());
}

export function performActionsAllInOne (actions) {
    return Promise.all(_.map(actions, action => action()))
}
