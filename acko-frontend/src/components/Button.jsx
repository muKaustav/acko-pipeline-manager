import React from 'react'

const Button = ({ children, className, ...props }) => {
	return (
		<button
			className={`px-3 sm:px-4 py-2 rounded text-white transition-colors text-sm sm:text-base w-full sm:w-auto ${className}`}
			{...props}>
			{children}
		</button>
	)
}

export default Button
