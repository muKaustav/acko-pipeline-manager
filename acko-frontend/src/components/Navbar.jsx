import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiMenu, HiX, HiPlusCircle } from 'react-icons/hi'

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false)

	const toggleMenu = () => {
		setIsOpen(!isOpen)
	}

	return (
		<nav className="bg-gray-800 shadow-md fixed top-0 left-0 w-full z-50">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					<Link
						to="/"
						className="text-lg sm:text-xl font-medium text-blue-300 hover:text-blue-100 transition-colors duration-200">
						Pipeline Manager
					</Link>
					<div className="hidden md:flex items-center space-x-4">
						<Link
							to="/"
							className="text-gray-300 hover:text-white transition-colors duration-200">
							Dashboard
						</Link>
						<Link
							to="/create"
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 flex items-center">
							<HiPlusCircle className="w-5 h-5 mr-2" />
							Create Pipeline
						</Link>
					</div>
					<div className="md:hidden">
						<button
							onClick={toggleMenu}
							className="text-gray-300 hover:text-white focus:outline-none focus:text-white">
							{isOpen ? (
								<HiX className="h-6 w-6" />
							) : (
								<HiMenu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>
			</div>
			{/* Mobile menu */}
			{isOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						<Link
							to="/"
							className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
							onClick={toggleMenu}>
							Dashboard
						</Link>
						<Link
							to="/create"
							className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium flex items-center"
							onClick={toggleMenu}>
							<HiPlusCircle className="w-5 h-5 mr-2" />
							Create Pipeline
						</Link>
					</div>
				</div>
			)}
		</nav>
	)
}

export default Navbar
