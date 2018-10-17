import React, {Component} from 'react';
import web3 from "../web3";
import marketplace from "../Marketplace";
import Web3 from 'web3';
import {errorMessageTemplate, userInfoConvertor} from '../utils';
import {Button, Form, Input, Grid, Segment, Header} from 'semantic-ui-react';
import {connect} from 'react-redux';
import AdminList from '../components/admin/AdminList';
import FooterInfos from '../components/FooterInfos';

const web3Utils = Web3.utils;

class AdminManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            account: '0x0',
            newNumber: '',
            currentNumber: '',
            marketplaceInstance: null,
            loading: false,
            adminList: [],

            //form value
            adminAddress: "",
            adminName: "",
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

        this.getAdminList();
        this.addEventListeners();
    }

    /**
     * Main render method
     * @returns {*}
     */
    render() {
        return (
            <div>
                <Header as='h1'>Manage Admins</Header>
                <Grid>
                    <Grid.Column width={10}>
                        <AdminList
                            onEditAdmin={this.onEditAdmin.bind(this)}
                            onRemoveAdmin={this.onRemoveAdmin.bind(this)}
                            adminList={this.state.adminList}
                        />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        {!this.state.showEditForm ? this.renderAddForm() : this.renderEditForm()}
                    </Grid.Column>
                </Grid>
                <FooterInfos type="adminManager"/>
            </div>
        );
    }

    /**
     * Render admin insert form
     * @returns {*}
     */
    renderAddForm() {
        return (
            <Segment>
                <h2>Add new admin</h2>
                <Form onSubmit={this.onAddSubmit.bind(this)}>
                    <Form.Field>
                        <label>Admin Name</label>
                        <Input
                            value={this.state.adminName}
                            onChange={event => this.setState({adminName: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Admin Address</label>
                        <Input
                            value={this.state.adminAddress}
                            onChange={event => this.setState({adminAddress: event.target.value})}
                        />
                    </Form.Field>
                    <Button primary loading={this.props.loading}>Create!</Button>
                </Form>
            </Segment>
        );
    }

    /**
     * Render admin insert form
     * @returns {*}
     */
    renderEditForm() {
        return (
            <Segment>
                <h2>Update admin</h2>
                <Form onSubmit={this.onEditSubmit.bind(this)}>
                    <Form.Field>
                        <label>Admin Name</label>
                        <Input
                            value={this.state.adminName}
                            onChange={event => this.setState({adminName: event.target.value})}
                        />
                    </Form.Field>
                    <Button primary loading={this.props.loading}>Update!</Button>
                </Form>
            </Segment>
        );
    }

    onEditAdmin(address, name) {
        this.setState({
            adminAddress: address,
            adminName: name,
            showEditForm: true,
        });
    }

    /**
     * Get admin list from remote
     * @returns {Promise<void>}
     */
    async getAdminList() {
        try {
            const result = await this.state.marketplaceInstance.getAdminWithInfo();
            this.setState({
                adminList: userInfoConvertor(result),
            });
        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: err.message
                }
            });
        }
    }

    /**
     * Remove admin handler
     * @param address Address
     */
    onRemoveAdmin(address) {
        if (!confirm("Are you sure you want to remove this admin (" + address + ")?")) {
            return;
        }

        this.props.dispatch({
            type: 'ENABLE_LOADING',
        });
        this.state.marketplaceInstance.removeAdmin(address, {from: this.state.account, gas: 2100000});
    }

    /**
     * New admin insert handler
     * @returns {Promise<void>}
     */
    async onAddSubmit() {
        const {adminAddress, adminName} = this.state;

        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });

        let validationErrors = [];

        if (!web3Utils.isAddress(adminAddress)) {
            validationErrors.push('Given admin address is invalid');
        }

        if (!adminName) {
            validationErrors.push('Enter an admin name');
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
            await this.state.marketplaceInstance.createAdmin(
                adminAddress,
                web3Utils.utf8ToHex(adminName),
                {from: this.state.account, gas: 2100000}
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
     * admin update form handler
     */
    async onEditSubmit() {
        const {adminAddress, adminName} = this.state;

        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });

        let validationErrors = [];

        if (!web3Utils.isAddress(adminAddress)) {
            validationErrors.push('Given admin address is invalid');
        }

        if (!adminName) {
            validationErrors.push('Enter an admin name');
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
            await this.state.marketplaceInstance.updateAdminName(
                adminAddress,
                web3Utils.utf8ToHex(adminName),
                {from: this.state.account, gas: 2100000}
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
            adminAddress: "",
            adminName: "",
            showEditForm: false,
        });

        //result.args
        // eventten sonra tetiklenecek
        this.getAdminList();
    }

    addEventListeners() {
        this.state.marketplaceInstance.AdminAdded().watch(this.afterUpdate.bind(this));
        this.state.marketplaceInstance.AdminRemoved().watch(this.afterUpdate.bind(this));
        this.state.marketplaceInstance.AdminUpdated().watch(this.afterUpdate.bind(this));
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        loading: state.loading
    }
};

export default connect(mapStateToProps)(AdminManager);
