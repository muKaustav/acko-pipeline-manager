import React, { useState } from 'react'

const SelectField = ({
	label,
	name,
	value,
	onChange,
	options,
	required = false,
}) => {
	const [focused, setFocused] = useState(false)
	const isActive = focused || value !== ''

	return (
		<div className="relative mt-4">
			<select
				name={name}
				id={name}
				value={value}
				onChange={onChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				className={`block w-full px-3 pt-5 pb-1 sm:pt-6 sm:pb-2 bg-gray-900 border rounded-md text-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none ${
					isActive ? 'border-blue-500' : 'border-gray-700'
				}`}
				required={required}>
				<option value="" disabled hidden></option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
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

export default SelectField
