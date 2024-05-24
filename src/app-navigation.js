/*const renderDocumentUploader = ({dropZoneWidth}) => {
    return (
        <DocumentUploader
            dropZoneWidth={dropZoneWidth}
        />
    );
}
const template = <Template name={'menu-item'} render={renderDocumentUploader} />*/

export const navigation = [
    {
        compactModeOnly: false,
        expandedModeOnly: false,
        id: 'home',
        key: 'home',
        text: 'Home',
        path: '/home',
        icon: 'home'
    },
    {
        compactModeOnly: false,
        expandedModeOnly: false,
        id: 'documents',
        key: 'documents',
        text: 'Documents',
        path: '/documents',
        icon: 'folder'
    },
    {
        compactModeOnly: false,
        expandedModeOnly: false,
        id: 'account',
        key: 'account',
        text: 'Account',
        icon: 'user',
        items: [
            {
                id: 'profile',
                key: 'profile',
                text: 'Profile',
                path: '/profile',
                keyFn: () => 'profile'
            },
            {
                id: 'logout',
                key: 'logout',
                text: 'Logout',
                path: '/logout',
                keyFn: () => 'logout'
            }
        ]
    },
    {
        compactModeOnly: false,
        expandedModeOnly: true,
        id: 'upload-document',
        key: 'upload-document',
        text: 'Upload Document',
    },
    {
        compactModeOnly: true,
        expandedModeOnly: false,
        id: 'upload-document-button',
        key: 'upload-document-button',
        icon: 'upload',
    }
];

