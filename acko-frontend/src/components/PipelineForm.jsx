import React, { useState, useEffect } from 'react'
import { MdCloudUpload, MdSave } from 'react-icons/md'
import InputField from './InputField'
import TextAreaField from './TextAreaField'
import SelectField from './SelectField'
import { sourceTypes, destinationTypes } from '../utils/config'

const PipelineForm = ({ onSubmit, initialData = {} }) => {
	const [formData, setFormData] = useState({
		name: initialData.name || '',
		description: initialData.description || '',
		sourceType: initialData.sourceType || '',
		destinationType: initialData.destinationType || '',
		file: null,
	})
	const [error, setError] = useState('')

	useEffect(() => {
		if (
			formData.sourceType &&
			formData.destinationType &&
			formData.sourceType === formData.destinationType
		) {
			setError('Source and destination types cannot be the same.')
		} else {
			setError('')
		}
	}, [formData.sourceType, formData.destinationType])

	const handleChange = (e) => {
		const { name, value, type } = e.target
		setFormData((prevData) => ({
			...prevData,
			[name]: type === 'file' ? e.target.files[0] : value,
		}))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		if (!error) {
			onSubmit(formData)
		}
	}

	const isFileUploadEnabled =
		formData.sourceType === 'csv' || formData.sourceType === 'json'

	const sourceOptions = sourceTypes.map((type) => ({
		value: type,
		label: type.toUpperCase(),
	}))
	const destinationOptions = destinationTypes.map((type) => ({
		value: type,
		label: type.toUpperCase(),
	}))

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-gray-200">
			<div className="flex flex-col space-y-4">
				<div className="space-y-4">
					<InputField
						label="Name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
					/>
					<TextAreaField
						label="Description"
						name="description"
						value={formData.description}
						onChange={handleChange}
						rows={4}
					/>
				</div>
				<div className="space-y-4">
					<SelectField
						label="Source"
						name="sourceType"
						value={formData.sourceType}
						onChange={handleChange}
						options={sourceOptions}
						required
					/>
					{isFileUploadEnabled && (
						<div className="mt-4">
							<label className="w-full flex justify-center px-3 sm:px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
								<MdCloudUpload className="mr-2 h-5 w-5" />
								<span>Choose file</span>
								<input
									type="file"
									name="file"
									id="file"
									onChange={handleChange}
									accept={formData.sourceType === 'csv' ? '.csv' : '.json'}
									className="sr-only"
								/>
							</label>
							{formData.file && (
								<p className="mt-2 text-sm text-gray-400">
									Selected file: {formData.file.name}
								</p>
							)}
						</div>
					)}
					<SelectField
						label="Destination"
						name="destinationType"
						value={formData.destinationType}
						onChange={handleChange}
						options={destinationOptions}
						required
					/>
				</div>
			</div>
			{error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
			<div className="mt-6">
				<button
					type="submit"
					disabled={!!error}
					className={`w-full flex justify-center items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
						error
							? 'bg-gray-500 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
					}`}>
					<MdSave className="mr-2 h-5 w-5" />
					Save Pipeline
				</button>
			</div>
		</form>
	)
}

export default PipelineForm
