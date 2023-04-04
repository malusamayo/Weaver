import React, { useEffect, useLayoutEffect } from "react";
import "./AlertDelete.css"

const AlertDelete = ({ node, onConfirm, setIsDeleting, isDeleting}) => {
    
    const handleConfirm = () => {
        console.log("Confirming")
        if (node.exampleText) {
            onConfirm(node.id); // delete example
        } else {
            onConfirm(); // delete folder
        }
        setIsDeleting(false);
    };
    
    const handleCancel = () => {
        console.log("Canceling")
        setIsDeleting(false);
    };
    
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                handleCancel();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
        if (isDeleting) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isDeleting]);

    useEffect(() => {
        if (isDeleting) {
            document.querySelector(".alert-delete__actions button:last-child").focus();
        }
    }, [isDeleting]);

    const nodeName = node.exampleText ? "the example" : "\"" + node.name  + "\"";

    return (
        isDeleting ?
        <div className="alert-delete-container">
                <div className="alert-delete">
                    <div className="alert-delete__content">
                    <p>Are you sure you want to delete {nodeName}?</p>
                    <div className="alert-delete__actions">
                        <button onClick={handleCancel}>Cancel</button> 
                        <button onClick={handleConfirm} autoFocus>Delete</button>
                    </div>
                </div>
            </div>
        </div> :
        null
    );
};

export { AlertDelete };