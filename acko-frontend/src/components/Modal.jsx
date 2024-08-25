import React from 'react'
import ReactDOM from 'react-dom'
import ActionButton from './ActionButton'
import { MdClose } from 'react-icons/md'

const Modal = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null

	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex p-4">
			<div className="relative bg-gray-800 w-full max-w-3xl m-auto rounded-lg">
				<div className="flex flex-col space-y-4 p-4 sm:p-6">
					<div className="flex justify-between items-center">
						<h2 className="text-lg sm:text-xl font-semibold text-gray-200">
							Full Logs
						</h2>
						<ActionButton
							onClick={onClose}
							className="bg-red-600 hover:bg-red-700"
							title="Close">
							<MdClose size={18} />
						</ActionButton>
					</div>
					<div className="bg-gray-900 p-4 rounded-lg h-96 overflow-y-auto text-sm">
						{children}
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal
