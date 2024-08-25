import React, { useState } from 'react'

const InputField = ({
	label,
	name,
	value,
	onChange,
	type = 'text',
	required = false,
}) => {
	const [focused, setFocused] = useState(false)
	const isActive = focused || value !== ''

	const hasSpecialChars = (str) => {
		const specialChars = /[^a-zA-Z0-9 ]/
		return specialChars.test(str)
	}

	const handleChange = (e) => {
		const newValue = e.target.value
		if (hasSpecialChars(newValue)) {
			alert('Special characters are not allowed.')
			return
		}
		onChange(e)
	}

	return (
		<div className="relative mt-4">
			<input
				type={type}
				name={name}
				id={name}
				value={value}
				onChange={handleChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				className={`block w-full px-3 pt-5 pb-1 sm:pt-6 sm:pb-2 bg-gray-900 border rounded-md text-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
					isActive ? 'border-blue-500' : 'border-gray-700'
				}`}
				required={required}
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

export default InputField
