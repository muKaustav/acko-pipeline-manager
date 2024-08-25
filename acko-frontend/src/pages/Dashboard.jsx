import React, { useState, useEffect } from 'react'
import { MdRefresh } from 'react-icons/md'
import ActionButton from '../components/ActionButton'
import PipelineList from '../components/PipelineList'
import SearchBar from '../components/SearchBar'
import { useWebSocket } from '../webSocketContext'

const Dashboard = () => {
	const [pipelines, setPipelines] = useState([])
	const [filteredPipelines, setFilteredPipelines] = useState([])
	const [noResults, setNoResults] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const { pipelineUpdates } = useWebSocket()

	const headers = ['name', 'status', 'lastRunAt']

	const fetchPipelines = async () => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/pipelines`,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
				}
			)
			console.log('Response status:', response.status)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const jsonData = await response.json()
			console.log('Parsed JSON:', jsonData)

			if (jsonData.success && Array.isArray(jsonData.data)) {
				setPipelines(jsonData.data)
				setFilteredPipelines(jsonData.data)
			} else {
				throw new Error('Unexpected response structure')
			}
		} catch (err) {
			console.error('Fetch error:', err)
			setError(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchPipelines()
	}, [])

	useEffect(() => {
		if (pipelineUpdates && Object.keys(pipelineUpdates).length > 0) {
			console.log('Pipeline status updates received:', pipelineUpdates)
			setPipelines((prevPipelines) =>
				prevPipelines.map((pipeline) => {
					const update = pipelineUpdates[pipeline._id]

					if (update) {
						return {
							...pipeline,
							status: update.status || pipeline.status,
							lastRunAt: update.lastRunAt || pipeline.lastRunAt,
						}
					}
					return pipeline
				})
			)
		}
	}, [pipelineUpdates])

	useEffect(() => {
		setFilteredPipelines(pipelines)
	}, [pipelines])

	const handleRefresh = () => {
		fetchPipelines()
	}

	const handleSearch = (searchTerm) => {
		if (!searchTerm) {
			setFilteredPipelines(pipelines)
			setNoResults(false)
			return
		}

		const filtered = pipelines.filter((pipeline) =>
			Object.entries(pipeline).some(
				([key, value]) =>
					headers.includes(key) &&
					value.toString().toLowerCase().includes(searchTerm.toLowerCase())
			)
		)

		setFilteredPipelines(filtered)
		setNoResults(filtered.length === 0)
	}

	return (
		<div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
					Dashboard
				</h1>

				<ActionButton
					onClick={handleRefresh}
					className="bg-blue-600 hover:bg-blue-700"
					disabled={isLoading}
					title="Refresh Data">
					<MdRefresh size={24} />
					<span className="sr-only">Refresh Data</span>
				</ActionButton>
			</div>

			<div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg space-y-4">
				<h2 className="text-lg sm:text-xl font-semibold text-gray-200">
					Pipeline Overview
				</h2>

				{error && (
					<div className="bg-red-500 text-white p-4 rounded-md">{error}</div>
				)}

				<SearchBar onSearch={handleSearch} headers={headers} data={pipelines} />

				{isLoading ? (
					<div className="text-center text-gray-400 py-4">Loading...</div>
				) : noResults ? (
					<div className="text-center text-gray-400 py-4">
						No pipelines found matching your search criteria
					</div>
				) : (
					<PipelineList
						pipelines={filteredPipelines}
						onPipelineUpdate={handleRefresh}
					/>
				)}
			</div>
		</div>
	)
}

export default Dashboard
