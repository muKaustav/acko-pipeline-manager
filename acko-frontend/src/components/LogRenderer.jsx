import React from 'react'

const LogRenderer = ({ logs }) => {
	const getLogLevelColor = (level) => {
		switch (level.toLowerCase()) {
			case 'info':
				return 'text-blue-400'
			case 'warning':
				return 'text-yellow-400'
			case 'error':
				return 'text-red-400'
			default:
				return 'text-gray-400'
		}
	}

	return (
		<div className="space-y-2">
			{logs.map((log, index) => (
				<div key={index} className="bg-gray-800 p-3 rounded-lg">
					<div className="flex justify-between items-center mb-1">
						<span className="text-sm text-gray-400">
							{new Date(log.timestamp).toLocaleString()}
						</span>
						<span
							className={`text-sm font-semibold ${getLogLevelColor(
								log.level
							)}`}>
							{log.level.toUpperCase()}
						</span>
					</div>
					<p className="text-white">{log.message}</p>
					{log.details && (
						<div className="mt-2">
							<p className="text-sm text-gray-400">Details:</p>
							<pre className="text-xs text-gray-300 bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
								{JSON.stringify(log.details, null, 2)}
							</pre>
						</div>
					)}
				</div>
			))}
		</div>
	)
}

export default LogRenderer
