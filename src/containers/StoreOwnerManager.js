import React, {Component} from 'react';
import web3 from "../web3";
import marketplace from "../Marketplace";
import Web3 from 'web3';
import {connect} from 'react-redux';
import {errorMessageTemplate, userInfoConvertor} from '../utils';
import {Button, Form, Input, Grid, Segment, Header} from 'semantic-ui-react';
import FooterInfos from '../components/FooterInfos';
import StoreOwnerList from '../components/store-owner/StoreOwnerList'

const web3Utils = Web3.utils;

class StoreOwnerManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            account: '0x0',
            newNumber: '',
            currentNumber: '',
            marketplaceInstance: null,
            loading: false,
            storeOwnerList: [],

            //form value
            storeOwnerAddress: "",
            storeOwnerName: "",
            showEditForm: false,
        };
    }

    async componentDidMount() {
        let accounts = await web3.eth.getAccounts();
        let marketplaceInstance = await marketplace.deployed();

        this.setState({
            account: accounts[0],
            marketplaceInstance: marketplaceInstance,
        });

        this.getStorageOwnerList();
        this.addEventListeners();
    }

    /**
     * Main render method
     * @returns {*}
     */
    render() {
        return (
            <div>
                <Header as='h1'>Manage Store Owners</Header>
                <Grid stackable columns={2}>
                    <Grid.Column width={10}>
                        <StoreOwnerList
                            onEditStoreOwner={this.onEditStoreOwner.bind(this)}
                            onRemoveStoreOwner={this.onRemoveStoreOwner.bind(this)}
                            storeOwnerList={this.state.storeOwnerList}
                        />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        {
                            !this.state.showEditForm
                                ? this.renderAddForm()
                                : this.renderEditForm()
                        }
                    </Grid.Column>
                </Grid>
                <FooterInfos type="storeOwnerManager"/>
            </div>
        );
    }


    /**
     * @param address storage owner address
     * @param name storage owner name
     */
    onEditStoreOwner(address, name) {
        this.setState({
            storeOwnerAddress: address,
            storeOwnerName: name,
            showEditForm: true,
        });
    }

    /**
     * Render store owner edit form
     * @returns {*}
     */
    renderEditForm() {
        return (
            <Segment>
                <h2>Update storage owner name</h2>
                <Form onSubmit={this.onEditSubmit.bind(this)}>
                    <Form.Field>
                        <label>Storage owner Name</label>
                        <Input
                            value={this.state.storeOwnerName}
                            onChange={event => this.setState({storeOwnerName: event.target.value})}
                        />
                    </Form.Field>
                    <Button primary loading={this.props.loading}>Update!</Button>
                </Form>
            </Segment>
        );
    }

    /**
     * Render store owner insert form
     * @returns {*}
     */
    renderAddForm() {
        return (
            <Segment>
                <h2>Add new storage owner</h2>
                <Form onSubmit={this.onAddSubmit.bind(this)}>
                    <Form.Field>
                        <label>Storage owner Name</label>
                        <Input
                            value={this.state.storeOwnerName}
                            onChange={event => this.setState({storeOwnerName: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Storage owner Address</label>
                        <Input
                            value={this.state.storeOwnerAddress}
                            onChange={event => this.setState({storeOwnerAddress: event.target.value})}
                        />
                    </Form.Field>
                    <Button primary loading={this.props.loading}>Create!</Button>
                </Form>
            </Segment>
        );
    }

    /**
     * Get admin list from remote
     * @returns {Promise<void>}
     */
    async getStorageOwnerList() {
        try {
            const result = await this.state.marketplaceInstance.getStoreOwnerWithInfo.call();
            this.setState({
                storeOwnerList: userInfoConvertor(result),
            });
        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    // content: "An error occurred while an admin is creating."
                    content: err.message
                }
            });
        }
    }

    /**
     * Remove admin handler
     * @param address Address
     */
    onRemoveStoreOwner(address) {
        if (!confirm("Are you sure you want to remove this Storage Owner (" + address + ")?")) {
            return;
        }

        this.props.dispatch({
            type: 'ENABLE_LOADING',
        });

        this.state.marketplaceInstance.removeStoreOwner(address, {from: this.state.account, gas: 2100000});
    }

    /**
     * New store owner insert handler
     */
    async onAddSubmit() {
        const {storeOwnerAddress, storeOwnerName} = this.state;

        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });

        let validationErrors = [];

        if (!storeOwnerName) {
            validationErrors.push('Enter a store owner name');
        }

        if (!web3Utils.isAddress(storeOwnerAddress)) {
            validationErrors.push('Given admin address is invalid');
        }

        if (validationErrors.length > 0) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: errorMessageTemplate(validationErrors)
                }
            });
            return;
        }

        try {
            await this.state.marketplaceInstance.createStoreOwner(
                storeOwnerAddress,
                web3Utils.utf8ToHex(storeOwnerName),
                {
                    from: this.state.account,
                    gas: 2100000
                }
            );
        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    // content: "An error occurred while an admin is creating."
                    content: err.message
                }
            });
        }
    }

    /**
     * Update a store owner edit handler
     */
    async onEditSubmit() {
        const {storeOwnerAddress, storeOwnerName} = this.state;

        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });

        let validationErrors = [];

        if (!storeOwnerName) {
            validationErrors.push('Enter a store owner name');
        }

        if (!web3Utils.isAddress(storeOwnerAddress)) {
            validationErrors.push('Given admin address is invalid');
        }

        if (validationErrors.length > 0) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: errorMessageTemplate(validationErrors)
                }
            });
            return;
        }

        try {
            await this.state.marketplaceInstance.updateStoreOwnerName(
                storeOwnerAddress,
                web3Utils.utf8ToHex(storeOwnerName),
                {
                    from: this.state.account,
                    gas: 2100000
                }
            );
        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    // content: "An error occurred while an admin is creating."
                    content: err.message
                }
            });
        }
    }

    afterUpdate(error, result) {
        if (error) {
            console.log(error);
        }

        this.props.dispatch({
            type: 'DISABLE_LOADING'
        });

        this.setState({
            storeOwnerAddress: "",
            storeOwnerName: "",
            showEditForm: false,
        });

        //result.args
        // eventten sonra tetiklenecek
        this.getStorageOwnerList();
    }

    addEventListeners() {
        this.state.marketplaceInstance.StoreOwnerAdded().watch(this.afterUpdate.bind(this));
        this.state.marketplaceInstance.StoreOwnerRemoved().watch(this.afterUpdate.bind(this));
        this.state.marketplaceInstance.StoreOwnerUpdated().watch(this.afterUpdate.bind(this));
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        loading: state.loading
    };
};

export default connect(mapStateToProps)(StoreOwnerManager);
