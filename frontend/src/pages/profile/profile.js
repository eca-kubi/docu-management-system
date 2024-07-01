import React, {useState} from 'react';
import './profile.scss';
import Form from 'devextreme-react/form';
import {useAuth} from "../../contexts/auth";

export default function Profile() {
    const {user} = useAuth()
    const [notes, setNotes] = useState(
        user.bio
    );
    const formData = {
        ID: user.id,
        FirstName: user.firstName,
        LastName: user.lastName,
        Prefix: user.prefix,
        Position: user.position,
        Picture: user.avatar,
        BirthDate: new Date('1974/11/5'),
        HireDate: new Date('2005/05/11'),
        Notes: notes,
        Address: '4600 N Virginia Rd.'
    };

    return (
        <React.Fragment>
            <h2 className={'content-block'}>Profile</h2>

            <div className={'content-block dx-card responsive-paddings'}>
                <div className={'form-avatar'}>
                    <img
                        alt={''}
                        src={user.avatar}
                    />
                </div>
                <span>{notes}</span>
            </div>

            <div className={'content-block dx-card responsive-paddings'}>
                <Form
                    id={'form'}
                    defaultFormData={formData}
                    onFieldDataChanged={e => e.dataField === 'Notes' && setNotes(e.value)}
                    labelLocation={'top'}
                    colCountByScreen={colCountByScreen}
                />
            </div>
        </React.Fragment>
    );
}

const colCountByScreen = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4
};
