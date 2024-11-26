'use client';
import React from 'react'
import TooltipComponent from '../global/tooltip-component'
import { PlusIcon } from 'lucide-react'

const UploadsDropDownList = () => {
    function addUploadFileHandler() {
        throw new Error('Function not implemented.')
    }

    return (
        <div
            className="flex
        sticky 
        z-20 
        top-0 
        bg-background 
        w-full  
        h-10 
        group/title 
        justify-between 
        items-center 
        pr-4 
        text-Neutrals/neutrals-8
  "
        >
            <span
                className="text-Neutrals-8 
        font-bold 
        text-xs"
            >
                CARICAMENTI
            </span>
            <TooltipComponent message="Create Folder">
                <PlusIcon
                    onClick={addUploadFileHandler}
                    size={16}
                    className="group-hover/title:inline-block
            hidden 
            cursor-pointer
            hover:dark:text-white
          "
                />
            </TooltipComponent>
        </div>
    )
}

export default UploadsDropDownList
