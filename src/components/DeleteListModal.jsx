import React, { Component } from 'react';

export default class DeleteListModal extends Component {
    componentDidMount() {
    // capture so inputs elsewhere can't swallow it
        document.addEventListener('keydown', this.handleKeyDown, true);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown, true);
    }

    handleKeyDown = (e) => {
    const modal = document.getElementById('delete-list-modal');
    if (!modal || !modal.classList.contains('is-visible')) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.deleteListCallback();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.props.hideDeleteListModalCallback();
    }
    };

    render() {
        const { listKeyPair, deleteListCallback, hideDeleteListModalCallback } = this.props;
        let name = "";
        if (listKeyPair) {
            name = listKeyPair.name;
        }
        return (
            <div 
                class="modal" 
                id="delete-list-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='verify-delete-list-root'>
                        <div class="modal-north">
                            Delete playlist?
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                                Are you sure you wish to permanently delete the {name} playlist?
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="delete-list-confirm-button" 
                                class="modal-button" 
                                onClick={deleteListCallback}
                                value='Confirm' />
                            <input type="button" 
                                id="delete-list-cancel-button" 
                                class="modal-button" 
                                onClick={hideDeleteListModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}