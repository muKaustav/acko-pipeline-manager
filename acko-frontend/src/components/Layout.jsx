import React from 'react'
import Navbar from './Navbar'

const Layout = ({ children }) => {
	return (
		<div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
			<Navbar />
			<main className="flex-grow container mx-auto px-4 sm:px-4 lg:px-4 py-6 sm:py-8 pt-20 sm:pt-24">
				{children}
			</main>
		</div>
	)
}

export default Layout
