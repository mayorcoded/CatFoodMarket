import React, {Component} from 'react';
import {Button, Segment, Table} from "semantic-ui-react";

export default class StoreOwnerList extends Component{

    render() {
        return <Segment>
            <h2>Storage Owner list</h2>
            {this.props.storeOwnerList.length === 0 ? <h3>Add your first storage owner</h3> : this.renderListTable()}
        </Segment>
    }

    renderListTable() {
        const {Header, Row, HeaderCell, Body} = Table;
        return (
            <Table>
                <Header>
                    <Row>
                        <HeaderCell>ID</HeaderCell>
                        <HeaderCell>Name</HeaderCell>
                        <HeaderCell>Address</HeaderCell>
                        <HeaderCell>Actions</HeaderCell>
                    </Row>
                </Header>
                <Body>
                {this.renderRow()}
                </Body>
            </Table>
        );
    }

    /**
     * Render an admin as table row
     */
    renderRow() {
        const {Row, Cell} = Table;
        return this.props.storeOwnerList.map((item, index) => {
            return <Row key={index}>
                <Cell>{item.id}</Cell>
                <Cell>{item.name}</Cell>
                <Cell>{item.addr}</Cell>
                <Cell>
                    <Button.Group>
                        <Button size='small' compact onClick={() => this.props.onEditStoreOwner(item.addr, item.name)} color="teal">Edit</Button>
                        <Button size='small' compact onClick={() => this.props.onRemoveStoreOwner(item.addr)} color="red">Remove</Button>
                    </Button.Group>
                </Cell>
            </Row>
        });
    }
}