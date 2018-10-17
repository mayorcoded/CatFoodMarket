import {createStore} from 'redux';

const initialState = {
    loading: false,
    message: {
        header: 'OPPS!!',
        content: '',
    },
    metamask: false,
};

// reducers
export const global = (state = {}, action) => {
    switch (action.type) {
        case 'ENABLE_LOADING':
            return {
                ...state,
                loading: true,
                message: {
                    header: '',
                    content: ''
                }
            };

        case 'DISABLE_LOADING':
            return {
                ...state,
                loading: false
            };
        case 'SHOW_MESSAGE':
            return {
                ...state,
                message: {
                    header: action.payload.header,
                    content: action.payload.content
                }
            };
        case 'HIDE_MESSAGE':
            return {
                ...state,
                message: {
                    content: ''
                }
            };
        case 'RESET':
            return initialState;
        case 'DISABLE_LOADING_WITH_MESSAGE':
            return {
                ...state,
                loading: false,
                message: {
                    header: action.payload.header,
                    content: action.payload.content
                }
            };
        case 'DISABLE_LOADING_HIDE_MESSAGE':
            return {
                ...state,
                loading: false,
                message: {
                    content: ''
                }
            };
        case 'ACTIVATE_METAMASK':
            return {
                ...state,
                metamask: true,
            };
        default:
            return state;
    }
};

export const store = createStore(
    global,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const {getState, dispatch} = store;
window.dispatchtest = dispatch;
// console.log(getState());