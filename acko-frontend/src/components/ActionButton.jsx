import React from 'react'
import { Link } from 'react-router-dom'

const ActionButton = ({
	to,
	onClick,
	className,
	title,
	children,
}) => {
	const baseClasses =
		'inline-flex items-center justify-center text-white rounded transition-all duration-200 relative group px-2 py-2'
	const Element = to ? Link : 'button'
	const props = to ? { to } : { onClick }

	return (
		<Element
			{...props}
			className={`${baseClasses} ${className}`}
			aria-label={title}>
			{children}
			<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-2 whitespace-nowrap min-w-[80px] text-center hidden sm:block">
				{title}
			</span>
		</Element>
	)
}

export default ActionButton
