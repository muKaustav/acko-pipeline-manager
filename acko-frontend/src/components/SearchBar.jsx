import React, { useState, useEffect, useRef } from 'react'
import { MdSearch, MdClose } from 'react-icons/md'

const SearchBar = ({ onSearch, headers, data }) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [suggestions, setSuggestions] = useState([])
	const [showSuggestions, setShowSuggestions] = useState(false)
	const searchRef = useRef(null)

	useEffect(() => {
		if (searchTerm.length > 0) {
			const uniqueSuggestions = new Set()
			data.forEach((item) => {
				Object.entries(item).forEach(([key, value]) => {
					if (
						headers.includes(key) &&
						value.toString().toLowerCase().includes(searchTerm.toLowerCase())
					) {
						uniqueSuggestions.add(
							JSON.stringify({ header: key, value: value.toString() })
						)
					}
				})
			})
			const filteredSuggestions = Array.from(uniqueSuggestions).map(JSON.parse)
			setSuggestions(filteredSuggestions)
			setShowSuggestions(true)
		} else {
			setSuggestions([])
			setShowSuggestions(false)
		}
	}, [searchTerm, headers, data])

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchRef.current && !searchRef.current.contains(event.target)) {
				setShowSuggestions(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleSearch = (term) => {
		setSearchTerm(term)
		onSearch(term)
	}

	const handleSuggestionClick = (suggestion) => {
		setSearchTerm(suggestion.value)
		onSearch(suggestion.value)
		setShowSuggestions(false)
	}

	return (
		<div className="relative w-full" ref={searchRef}>
			<div className="relative">
				<input
					type="text"
					className="w-full px-4 py-2 pr-10 text-sm text-gray-200 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Search pipelines..."
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
				/>
				<div className="absolute inset-y-0 right-0 flex items-center pr-3">
					{searchTerm ? (
						<MdClose
							className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-200"
							onClick={() => handleSearch('')}
						/>
					) : (
						<MdSearch className="w-5 h-5 text-gray-400" />
					)}
				</div>
			</div>
			{showSuggestions && (
				<ul className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
					{suggestions.length > 0 ? (
						suggestions.map((suggestion, index) => (
							<li
								key={index}
								className="px-4 py-2 text-sm text-gray-200 cursor-pointer hover:bg-gray-700"
								onClick={() => handleSuggestionClick(suggestion)}>
								<span className="font-semibold">{suggestion.header}:</span>{' '}
								{suggestion.value}
							</li>
						))
					) : (
						<li className="px-4 py-2 text-sm text-gray-400 italic">
							No results found
						</li>
					)}
				</ul>
			)}
		</div>
	)
}

export default SearchBar
