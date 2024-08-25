import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ActionButton from './ActionButton'
import { MdEdit, MdPlayArrow, MdDelete } from 'react-icons/md'

const PipelineList = ({ pipelines, onPipelineUpdate }) => {
	const [error, setError] = useState(null)
	const [successMessage, setSuccessMessage] = useState(null)

	useEffect(() => {
		if (error || successMessage) {
			const timer = setTimeout(() => {
				setError(null)
				setSuccessMessage(null)
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [error, successMessage])

	const runPipeline = async (pipelineId) => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/pipelines/run/${pipelineId}`,
				{ method: 'POST' }
			)

			if (!response.ok) throw new Error('Failed to run pipeline')

			setSuccessMessage(`Pipeline ${pipelineId} started successfully`)
		} catch (err) {
			setError(`Error running pipeline: ${err.message}`)
		}
	}

	const deletePipeline = async (pipelineId) => {
		if (window.confirm('Are you sure you want to delete this pipeline?')) {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_BACKEND_URL}/pipelines/${pipelineId}`,
					{ method: 'DELETE' }
				)

				if (!response.ok) throw new Error('Failed to delete pipeline')

				setSuccessMessage(`Pipeline ${pipelineId} deleted successfully`)
				onPipelineUpdate() // We still call this for deletions
			} catch (err) {
				setError(`Error deleting pipeline: ${err.message}`)
			}
		}
	}

	const getStatusColor = (status) => {
		switch (status) {
			case 'idle':
				return 'bg-blue-900 text-blue-200'
			case 'completed':
				return 'bg-green-900 text-green-200'
			case 'running':
				return 'bg-yellow-900 text-yellow-200'
			default:
				return 'bg-red-900 text-red-200'
		}
	}

	return (
		<div className="space-y-4">
			{error && (
				<div className="bg-red-500 text-white p-4 rounded-md">{error}</div>
			)}
			{successMessage && (
				<div className="bg-green-500 text-white p-4 rounded-md">
					{successMessage}
				</div>
			)}

			<div className="overflow-x-auto rounded-lg shadow-lg">
				<table className="min-w-full text-sm text-gray-200">
					<thead className="bg-gray-750">
						<tr>
							<th className="py-3 px-2 sm:px-4 text-left font-medium">Name</th>
							<th className="py-3 px-2 sm:px-4 text-center font-medium">
								Status
							</th>
							<th className="py-3 px-2 sm:px-4 text-center font-medium hidden sm:table-cell">
								Last Run
							</th>
							<th className="py-3 px-2 sm:px-4 text-center font-medium">
								Actions
							</th>
						</tr>
					</thead>

					<tbody className="bg-gray-800">
						{pipelines.length === 0 ? (
							<tr>
								<td
									colSpan="4"
									className="py-4 px-2 sm:px-4 text-center text-gray-400">
									No pipelines created yet.
								</td>
							</tr>
						) : (
							pipelines.map((pipeline) => (
								<tr
									key={pipeline._id}
									className="border-b border-gray-700 hover:bg-gray-750 transition-colors duration-150">
									<td className="py-3 px-2 sm:px-4">
										<Link
											to={`/manage/${pipeline._id}`}
											className="font-bold text-blue-400 hover:text-blue-300">
											{pipeline.name}
										</Link>
										<div className="text-xs text-gray-400 sm:hidden mt-1">
											{new Date(pipeline.lastRunAt).toLocaleString()}
										</div>
									</td>
									<td className="py-3 px-2 sm:px-4 text-center">
										<span
											className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
												pipeline.status
											)}`}>
											{pipeline.status}
										</span>
									</td>
									<td className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">
										{new Date(pipeline.lastRunAt).toLocaleString()}
									</td>
									<td className="py-3 px-2 sm:px-4 text-center">
										<div className="flex justify-center space-x-2">
											<ActionButton
												to={`/manage/${pipeline._id}`}
												className="bg-blue-600 hover:bg-blue-700"
												title="Edit Pipeline">
												<MdEdit size={18} />
											</ActionButton>
											<ActionButton
												onClick={() => runPipeline(pipeline._id)}
												className="bg-green-600 hover:bg-green-700"
												title="Run Pipeline">
												<MdPlayArrow size={18} />
											</ActionButton>
											<ActionButton
												onClick={() => deletePipeline(pipeline._id)}
												className="bg-red-600 hover:bg-red-700"
												title="Delete Pipeline">
												<MdDelete size={18} />
											</ActionButton>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default PipelineList
