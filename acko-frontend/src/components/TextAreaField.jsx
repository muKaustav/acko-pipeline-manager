import React, { useState } from 'react'

const TextAreaField = ({ label, name, value, onChange, rows = 4 }) => {
	const [focused, setFocused] = useState(false)
	const isActive = focused || value !== ''

	return (
		<div className="relative mt-4">
			<textarea
				name={name}
				id={name}
				value={value}
				onChange={onChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				className={`block w-full px-3 pt-5 pb-1 sm:pt-6 sm:pb-2 bg-gray-900 border rounded-md text-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
					isActive ? 'border-blue-500' : 'border-gray-700'
				}`}
				rows={rows}
			/>
			<label
				htmlFor={name}
				className={`absolute left-3 transition-all duration-200 ${
					isActive
						? 'top-1 text-xs text-blue-500'
						: 'top-3 sm:top-4 text-sm sm:text-base text-gray-400'
				}`}>
				{label}
			</label>
		</div>
	)
}

export default TextAreaField
