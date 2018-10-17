import React, {Component} from 'react';
import {Container, Message} from 'semantic-ui-react';
import Header from '../components/Header';
import {connect} from 'react-redux';
import {Route, withRouter} from 'react-router-dom';
import Footer from "../components/Footer";
import web3 from "../web3";
import marketplace from "../Marketplace";
import roleHelper from '../helpers/RoleHelper';
import {errorMessageTemplate, loadingTemplate} from '../utils'
import ProductList from "../containers/ProductList";
import AdminManager from "../containers/AdminManager";
import OwnerControls from "../containers/OwnerControls";
import StoreOwnerManager from "../containers/StoreOwnerManager";
import PurchasedProductsManager from "../containers/PurchasedProductsManager";
import StoreOwnerDashboard from "../containers/StoreOwnerDashboard";

class App extends Component {

    constructor(props) {

        super(props);

        this.state = {
            account: null,
            marketplaceInstance: null,
            senderRoles: null,
            roleHelper: null,
            lockRender: true,
        };

        this.props.history.listen((location, action) => {
            this.props.dispatch({type: 'HIDE_MESSAGE'});
        });
    }

    async componentDidMount() {
        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });

        let accounts = [null];
        let marketplaceInstance = null;
        let getSenderRole = null;

        if(web3.currentProvider.isMetaMask) {
            this.props.dispatch({
                type: 'ACTIVATE_METAMASK'
            })
        }

        try {
            accounts = await web3.eth.getAccounts();
            marketplaceInstance = await marketplace.deployed();
        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: err.message
                }
            });
            return;
        }

        getSenderRole = await marketplaceInstance.getSenderRole({from: accounts[0]});
        roleHelper.setRoles(getSenderRole);

        this.setState({
            account: accounts[0],
            marketplaceInstance: marketplaceInstance,
            senderRoles: getSenderRole,
            roleHelper: roleHelper,
            lockRender: false,
        });

        if(this.props.metamask) {
            // if user switch own account in metamask, page will be completely reloaded.
            web3.currentProvider.publicConfigStore.on('update', (data) => {
                if (String(data.selectedAddress).toLowerCase() !== String(this.state.account).toLowerCase()) {
                    window.location.href = "/";
                }
            });
        }

        this.props.dispatch({
            type: 'DISABLE_LOADING'
        });
    }

    render() {
        return (
            <div>
                <Header {...this.state} />
                {this.messageBox()}
                {this.getBody()}
                <Footer {...this.state} />
            </div>
        );
    }

    getBody() {
        return (
            this.state.lockRender
                ? ''
                : (
                    <Container>
                        <Route exact path="/" component={ProductList}/>
                        <Route exact path="/manage-admins" render={() => this.checkAuthorization(roleHelper.isSuperAdmin(), <AdminManager/>)}/>
                        <Route exact path="/owner-controls" render={() => this.checkAuthorization(roleHelper.isSuperAdmin(), <OwnerControls/>)}/>
                        <Route exact path="/manage-store-owners" render={() => this.checkAuthorization(roleHelper.isSuperAdmin() || roleHelper.isAdmin(), <StoreOwnerManager/>)}/>
                        {/*<Route exact path="/manage-store-products" component={ProductManager}/>*/}
                        <Route exact path="/store-owner-dashboard" render={() => this.checkAuthorization(roleHelper.isStoreOwner(), <StoreOwnerDashboard/>)}/>
                        <Route exact path="/purchased-products" component={PurchasedProductsManager}/>
                    </Container>
                )
        )
    }

    checkAuthorization(criteria, managerContainer) {

        if (!this.state.roleHelper) {
            return loadingTemplate();
        }

        if (criteria) {
            return managerContainer
        }

        return <Message negative>
            <Message.Header>You are not authorized to view this page.</Message.Header>
            <p>If you think there is a problem, please contact with CatStoreOwner.</p>
        </Message>
    }

    messageBox() {
        return (
            <Container style={{marginTop: '7em', marginBottom: '1em'}}>
                {
                    this.props.loading ? loadingTemplate() : ''
                }
                {
                    this.props.message.content ?
                        (
                            <Message negative>
                                <Message.Header>Opps!!</Message.Header>
                                <div>{this.props.message.content}</div>
                            </Message>
                        ) : ''
                }
            </Container>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        loading: state.loading,
        message: state.message,
        metamask: state.metamask
    }
};

export default withRouter(connect(mapStateToProps)(App));


