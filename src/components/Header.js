import React, {Component} from 'react';
import {Menu, Container, Icon} from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';

class Header extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Menu fixed='top' style={{height: 60}}>
                <Container>
                    <Menu.Item header name='CatFoods' as={NavLink} to='/' style={{fontSize: 16, fontWeight: "bold"}}>
                        <Icon size='big' name='paw'/>
                        CatFoods
                    </Menu.Item>
                    {this.renderMenu()}
                </Container>
            </Menu>
        );
    }

    renderMenu() {
        const {roleHelper} = this.props;

        if (roleHelper == null) {
            return '';
        }

        return (
            <Menu.Menu position="right">
                {roleHelper.isSuperAdmin() ? <Menu.Item name='Owner Controls' as={NavLink} to='/owner-controls'/> : ''}
                {roleHelper.isSuperAdmin() ? <Menu.Item name='Manage Admins' as={NavLink} to='/manage-admins'/> : ''}
                {roleHelper.isSuperAdmin() || roleHelper.isAdmin() ? <Menu.Item name='Manage Store Owners' as={NavLink} to='/manage-store-owners'/> : ''}
                {roleHelper.isStoreOwner() ? <Menu.Item name='Store Owner Dashboard' as={NavLink} to='/store-owner-dashboard'/> : ''}
                <Menu.Item name='Purchased Products' as={NavLink} to='/purchased-products'/>
            </Menu.Menu>
        );
    }
}

export default Header;
