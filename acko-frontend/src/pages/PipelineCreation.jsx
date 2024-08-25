import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PipelineForm from '../components/PipelineForm'

const PipelineCreation = () => {
	const [error, setError] = useState(null)
	const navigate = useNavigate()

	const handleSubmit = async (formData) => {
		setError(null)
		console.log('Creating new pipeline:', formData)

		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/pipelines`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				}
			)
			console.log('Response status:', response.status)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const jsonData = await response.json()

			if (jsonData.success) {
				console.log('Pipeline created:', jsonData.data)
				navigate('/')
			} else {
				throw new Error(jsonData.message || 'Unexpected response structure')
			}
		} catch (err) {
			console.error('Error creating pipeline:', err)
			setError(err.message)
		}
	}

	return (
		<div className="px-4 sm:px-0">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
				Create New Pipeline
			</h1>

			{error && (
				<div className="bg-red-500 text-white p-4 rounded-md mb-4">{error}</div>
			)}
			<PipelineForm onSubmit={handleSubmit} />
		</div>
	)
}

export default PipelineCreation
