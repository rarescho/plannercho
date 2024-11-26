import React from 'react';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import ProjectForm from './project-form';
// import SettingsForm from './settings-form'

interface ProjectProps {
    children: React.ReactNode;
}

const Project: React.FC<ProjectProps> = ({ children }) => {
    return (
        <CustomDialogTrigger
            header="Progetto riferimento"
            content={<ProjectForm />}
        >
            {children}
        </CustomDialogTrigger>
    );
};

export default Project;