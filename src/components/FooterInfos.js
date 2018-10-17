import React from 'react';
import {Button, Icon, Message} from "semantic-ui-react";

export default (props) => {

    if(props.type === 'adminManager') {
        return <Message icon>
            <Icon name='info'/>
            <Message.Content>
                <Message.Header>About this page</Message.Header>
                In this page, the owner can manage admins.
                <Message.List>
                    <Message.Item>Press <Button size='mini' color="teal">Edit</Button> button to show edit admin form.</Message.Item>
                    <Message.Item>Press <Button size='mini' color="red">Remove</Button> button to remove the admin.</Message.Item>
                    <Message.Item>Press <Button primary size='mini'>Create</Button> button to create an admin with given information.</Message.Item>
                </Message.List>
            </Message.Content>
        </Message>
    }

    if(props.type === "storeOwnerManager") {
        return <Message icon>
            <Icon name='info'/>
            <Message.Content>
                <Message.Header>About this page</Message.Header>
                In this page, an admin can manage store owners.<br/>
                !!!!Removing a storage owner is not recommended!!! because of some products might be related with this store owner.
                <Message.List>
                    <Message.Item>Press <Button size='mini' color="teal">Edit</Button> button to show edit store owner form.</Message.Item>
                    <Message.Item>Press <Button size='mini' color="red">Remove</Button> button to remove the store owner.</Message.Item>
                    <Message.Item>Press <Button primary size='mini'>Create</Button> button to create an store owner with given information.</Message.Item>
                </Message.List>
            </Message.Content>
        </Message>
    }

    return <div>-</div>;
}