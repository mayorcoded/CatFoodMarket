
class RoleHelper {
    roleInfo = [];
    /**
     * @param roleInfo [is super admin (owner), is admin, is store owner, is customer]
     */
    setRoles(roleInfo) {
        this.roleInfo = roleInfo;
    }

    isSuperAdmin() {
        if(typeof(this.roleInfo[0]) === "undefined") {
            return false
        }

        return !!this.roleInfo[0];
    }

    isAdmin() {
        if(typeof(this.roleInfo[1]) === "undefined") {
            return false
        }

        return !!this.roleInfo[1];
    }

    isStoreOwner() {
        if(typeof(this.roleInfo[2]) === "undefined") {
            return false
        }

        return !!this.roleInfo[2];
    }

    isRegularUser() {
        if(typeof(this.roleInfo[3]) === "undefined") {
            return false
        }

        return !!this.roleInfo[3];
    }

    getMessage() {
        let messages = [];
        let rolesDescription = this.roleMessages();

        this.roleInfo.forEach((permission, index) => {

            if (permission === true) {
                messages.push(rolesDescription[index]);
            }
        });

        return messages;
    }

    /**
     * @returns {string[]}
     */
    roleMessages() {
        return [
            'You are owner of CatFoods. ',
            'You are an Admin in CatFoods. ',
            'You are a Store Owner in CatFoods. ',
            'You are a website visitor. '
        ];
    }

    getRoleInfo() {
        return this.roleInfo;
    }
}

export default new RoleHelper();