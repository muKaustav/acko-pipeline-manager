import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PipelineForm from '../components/PipelineForm'
import ActionButton from '../components/ActionButton'
import Modal from '../components/Modal'
import { useWebSocket } from '../webSocketContext'
import {
	MdPlayArrow,
	MdDelete,
	MdFullscreen,
	MdAccessTime,
	MdCheck,
	MdError,
	MdCloudDownload,
	MdCheckCircleOutline,
} from 'react-icons/md'

const PipelineManagement = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [pipeline, setPipeline] = useState(null)
	const [logs, setLogs] = useState([])
	const [files, setFiles] = useState([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [successMessage, setSuccessMessage] = useState(null)
	const [fileContent, setFileContent] = useState(null)
	const { pipelineUpdates } = useWebSocket()

	useEffect(() => {
		if (error || successMessage) {
			const timer = setTimeout(() => {
				setError(null)
				setSuccessMessage(null)
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [error, successMessage])

	const fetchPipeline = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/pipelines/${id}`,
				{
					method: 'GET',
					headers: { Accept: 'application/json' },
				}
			)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const jsonData = await response.json()

			if (jsonData.success && jsonData.data) {
				setPipeline(jsonData.data)
			} else {
				throw new Error('Unexpected response structure')
			}
		} catch (err) {
			console.error('Fetch error:', err)
			setError(`Failed to fetch pipeline: ${err.message}`)
		} finally {
			setIsLoading(false)
		}
	}, [id])

	const fetchLogs = useCallback(async () => {
		setError(null)
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/logs/pipelines/${id}`,
				{
					method: 'GET',
					headers: { Accept: 'application/json' },
				}
			)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const jsonData = await response.json()

			if (jsonData.success && Array.isArray(jsonData.data)) {
				setLogs(jsonData.data)
			} else {
				throw new Error('Unexpected response structure')
			}
		} catch (err) {
			console.error('Fetch logs error:', err)
			setError(`Failed to fetch logs: ${err.message}`)
		}
	}, [id])

	const fetchFiles = useCallback(async () => {
		setError(null)
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/files/${id}`,
				{
					method: 'GET',
					headers: { Accept: 'application/json' },
				}
			)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const jsonData = await response.json()

			if (jsonData.success && Array.isArray(jsonData.data)) {
				setFiles(jsonData.data)
			} else {
				throw new Error('Unexpected response structure')
			}
		} catch (err) {
			console.error('Fetch files error:', err)
			setError(`Failed to fetch files: ${err.message}`)
		}
	}, [id])

	useEffect(() => {
		fetchPipeline()
		fetchLogs()
		fetchFiles()
	}, [id, fetchPipeline, fetchLogs, fetchFiles])

	useEffect(() => {
		if (pipelineUpdates[id]) {
			setPipeline((prevPipeline) => {
				if (!prevPipeline) return null
				const update = pipelineUpdates[id]
				return {
					...prevPipeline,
					status: update.status,
					lastRunAt: update.lastRunAt || prevPipeline.lastRunAt,
				}
			})
			fetchLogs()
		}
	}, [pipelineUpdates, id, fetchLogs])

	const handleSubmit = async (formData) => {
		setError(null)
		setSuccessMessage(null)

		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/pipelines/${id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify(formData),
				}
			)

			const jsonData = await response.json()

			if (!response.ok) {
				throw new Error(
					jsonData.message || `HTTP error! status: ${response.status}`
				)
			}

			if (jsonData.success && jsonData.data) {
				setPipeline(jsonData.data)
				setSuccessMessage('Pipeline updated successfully')
			} else {
				throw new Error(jsonData.message || 'Failed to update pipeline')
			}
		} catch (err) {
			console.error('Update error:', err)
			setError(`Failed to update pipeline: ${err.message}`)
		}
	}

	const handleDelete = async () => {
		setError(null)
		setSuccessMessage(null)
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/pipelines/${id}`,
				{ method: 'DELETE' }
			)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const jsonData = await response.json()

			if (jsonData.success) {
				setSuccessMessage('Pipeline deleted successfully')
				setTimeout(() => navigate('/'), 2000)
			} else {
				throw new Error('Failed to delete pipeline')
			}
		} catch (err) {
			console.error('Delete error:', err)
			setError(`Failed to delete pipeline: ${err.message}`)
		}
	}

	const handleRun = async () => {
		setError(null)
		setSuccessMessage(null)
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/pipelines/run/${id}`,
				{ method: 'POST' }
			)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const jsonData = await response.json()

			if (jsonData.success && jsonData.data) {
				// setPipeline(jsonData.data)
				fetchLogs()
				setSuccessMessage('Pipeline execution started')
			} else {
				throw new Error('Failed to run pipeline')
			}
		} catch (err) {
			console.error('Run error:', err)
			setError(`Failed to run pipeline: ${err.message}`)
		}
	}

	const handleDownload = (fileId, fileName) => {
		const file = files.find((f) => f._id === fileId)
		if (!file) {
			setError(`File with ID ${fileId} not found`)
			return
		}

		setFileContent(file.content)

		const blob = new Blob([file.content], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.style.display = 'none'
		a.href = url
		a.download = fileName || `file-${fileId}.csv`
		document.body.appendChild(a)
		a.click()
		window.URL.revokeObjectURL(url)
		document.body.removeChild(a)

		setIsModalOpen(true)
	}

	const getStatusColor = (status) => {
		if (!status) return 'text-gray-500'
		switch (status.toLowerCase()) {
			case 'completed':
				return 'text-green-500'
			case 'failed':
				return 'text-red-500'
			case 'running':
				return 'text-yellow-500'
			default:
				return 'text-blue-500'
		}
	}

	const getStatusIcon = (status) => {
		if (!status) return <MdCheckCircleOutline className="text-gray-500" />
		switch (status.toLowerCase()) {
			case 'completed':
				return <MdCheck className="text-green-500" />
			case 'failed':
				return <MdError className="text-red-500" />
			case 'running':
				return <MdAccessTime className="text-yellow-500 animate-spin" />
			default:
				return <MdCheckCircleOutline className="text-blue-500" />
		}
	}

	if (isLoading) {
		return <div className="text-gray-200">Loading...</div>
	}

	if (error) {
		return <div className="bg-red-500 text-white p-4 rounded-md">{error}</div>
	}

	if (!pipeline) {
		return <div className="text-gray-200">No pipeline found.</div>
	}

	return (
		<div className="space-y-4 px-4 sm:px-0">
			{successMessage && (
				<div className="bg-green-500 text-white p-4 rounded-md">
					{successMessage}
				</div>
			)}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-100">
					Manage Pipeline: {pipeline.name}
				</h1>
				<div className="flex space-x-2 w-full sm:w-auto">
					<ActionButton
						onClick={handleRun}
						className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-auto"
						title="Run Pipeline">
						<MdPlayArrow size={18} />
						<span className="ml-2 sm:hidden">Run</span>
					</ActionButton>
					<ActionButton
						onClick={handleDelete}
						className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-auto"
						title="Delete Pipeline">
						<MdDelete size={18} />
						<span className="ml-2 sm:hidden">Delete</span>
					</ActionButton>
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="bg-gray-800 rounded-lg shadow-lg">
					<PipelineForm onSubmit={handleSubmit} initialData={pipeline} />
				</div>
				<div className="bg-gray-800 p-4 rounded-lg shadow-lg">
					<h2 className="text-lg font-semibold mb-4 text-gray-200">
						Pipeline Files
					</h2>
					<div className="max-h-80 overflow-y-auto">
						{files.length === 0 ? (
							<p className="text-gray-400">
								No files available for this pipeline.
							</p>
						) : (
							<ul className="space-y-2">
								{files.map((file) => (
									<li
										key={file._id}
										className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
										<span
											className="text-gray-300 truncate mr-2"
											title={file.filename}>
											{file.filename}
										</span>
										<ActionButton
											onClick={() => handleDownload(file._id, file.filename)}
											className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
											title={`Download ${file.filename}`}>
											<MdCloudDownload size={18} />
											<span className="ml-2">Download</span>
										</ActionButton>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="bg-gray-800 p-4 rounded-lg shadow-lg">
					<h2 className="text-lg font-semibold mb-4 text-gray-200">
						Pipeline Status
					</h2>
					<div className="grid grid-cols-2 gap-y-3 text-sm text-gray-300">
						<div className="col-span-2 flex items-center space-x-2">
							<span
								className={`text-lg font-semibold ${getStatusColor(
									pipeline.status
								)}`}>
								{getStatusIcon(pipeline.status)}
							</span>
							<span
								className={`text-lg font-semibold ${getStatusColor(
									pipeline.status
								)}`}>
								{pipeline.status || 'Unknown'}
							</span>
						</div>
						<div>
							<p className="text-gray-400">Last Run At</p>
							<p className="font-medium">
								{pipeline.lastRunAt
									? new Date(pipeline.lastRunAt).toLocaleString()
									: 'N/A'}
							</p>
						</div>
						<div>
							<p className="text-gray-400">Created At</p>
							<p className="font-medium">
								{pipeline.createdAt
									? new Date(pipeline.createdAt).toLocaleString()
									: 'N/A'}
							</p>
						</div>
						<div>
							<p className="text-gray-400">Updated At</p>
							<p className="font-medium">
								{pipeline.updatedAt
									? new Date(pipeline.updatedAt).toLocaleString()
									: 'N/A'}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-gray-800 p-4 rounded-lg shadow-lg">
					<div className="flex justify-between items-center mb-3">
						<h2 className="text-lg font-semibold text-gray-200">
							Last Run Logs
						</h2>
						<ActionButton
							onClick={() => setIsModalOpen(true)}
							className="bg-blue-600 hover:bg-blue-700"
							title="View Full Logs">
							<MdFullscreen size={18} />
						</ActionButton>
					</div>
					<div className="bg-gray-900 p-3 rounded-lg h-40 overflow-y-auto text-sm">
						{Array.isArray(logs) && logs.length > 0 ? (
							logs.slice(0, 5).map((log, index) => (
								<div key={index} className="mb-1 text-gray-300">
									<span className="text-gray-500">
										{new Date(log.timestamp).toLocaleString()}
									</span>{' '}
									- {log.level.toUpperCase()}: {log.message}
								</div>
							))
						) : (
							<div className="text-gray-400">No logs available</div>
						)}
					</div>
				</div>
			</div>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				{fileContent ? (
					<div className="text-gray-200">
						<h2 className="text-xl font-semibold mb-4">File Content</h2>
						<pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
							{fileContent}
						</pre>
					</div>
				) : Array.isArray(logs) && logs.length > 0 ? (
					<div>
						<h2 className="text-xl font-semibold mb-4 text-gray-200">
							Full Logs
						</h2>
						{logs.map((log, index) => (
							<div key={index} className="mb-2 text-gray-300">
								<span className="text-gray-500">
									{new Date(log.timestamp).toLocaleString()}
								</span>{' '}
								- {log.level.toUpperCase()}: {log.message}
							</div>
						))}
					</div>
				) : (
					<div className="text-gray-400">No content available</div>
				)}
			</Modal>
		</div>
	)
}

export default PipelineManagement
