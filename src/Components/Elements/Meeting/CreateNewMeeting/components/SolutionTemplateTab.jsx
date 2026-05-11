import CookieService from '../../../../Utils/CookieService';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../../Apicongfig';
import { useFormContext } from '../../../../../context/CreateMeetingContext';
import { solutionTypeIcons, typeIcons } from '../../../../Utils/MeetingFunctions';
import { Tooltip } from "antd";

function SolutionTemplateTab() {
    const [selectedId, setSelectedId] = useState(null);
    const [solutions, setSolutions] = useState([])
    const { setFormState, formState, meeting, setSelectedSolution } = useFormContext();

    useEffect(() => {
        const getSolutionTemplate = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/get-all-solutions`, {
                    headers: {
                        Authorization: `Bearer ${CookieService.get("token")}`
                    }
                });
                if (response?.status === 200) {
                    setSolutions(response?.data?.data)
                }
            } catch (error) {
                console.error("Error fetching solution templates:", error);
            }
        }

        getSolutionTemplate();
    }, [])

    useEffect(() => {
        // If formState.solution_id exists, set it as selected
        if (meeting?.solution_id) {
            setSelectedId(meeting.solution_id);
        }
    }, [formState?.solution_id, meeting]);

    useEffect(() => {
        if (formState?.solution_id && solutions.length > 0) {
            const selectedSolution = solutions.find(s => s.id === formState.solution_id);
            if (selectedSolution) {
                // setFormState(prev => ({
                //     ...prev,
                //     is_step_exists: selectedSolution.is_step_exists
                // }));
                setSelectedSolution(selectedSolution);
            }
        }
    }, [formState?.solution_id, solutions, setFormState, setSelectedSolution]);

    const handleSelect = (id) => {
        setSelectedId(id);
        const selectedSolution = solutions.find(s => s.id === id);
        if (selectedSolution) {
            setSelectedSolution(selectedSolution);
        }
        setFormState(prev => ({
            ...prev,
            solution_id: id,
            // is_step_exists: selectedSolution?.is_step_exists
        }));
    };



    return (
        <div className='mt-4 d-flex flex-wrap justify-content-start gap-4 px-3'>
            {solutions.map(template => {
                const isSelected = selectedId === template.id;

                // Icon Container
                const IconContainer = (
                    <div
                        className="d-flex align-items-center justify-content-center shadow-sm position-relative"
                        style={{
                            width: '68px',
                            height: '68px',
                            backgroundColor: '#fff',
                            borderRadius: '16px', // Rounded corners like iOS apps
                            border: isSelected ? '2px solid #0d6efd' : '1px solid #f0f0f0',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            overflow: 'hidden'
                        }}
                    >
                        {template?.logo ? (
                            <img
                                src={template.logo}
                                alt={template.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover" // Cover to fill the "app icon" shape
                                }}
                            />
                        ) : (
                            <div style={{ transform: 'scale(0.8)' }}>
                                {/* Fallback to type icon if no logo */}
                                {solutionTypeIcons[template?.type] || solutionTypeIcons["Other"]}
                            </div>
                        )}

                        {/* Selected Checkmark Overlay (Optional, but good for UX) */}
                        {isSelected && (
                            <div
                                className="position-absolute d-flex align-items-center justify-content-center"
                                style={{
                                    bottom: '-6px',
                                    right: '-6px',
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: '#0d6efd',
                                    borderRadius: '50%',
                                    border: '2px solid white'
                                }}
                            >
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </div>
                );

                return (
                    <div
                        key={template.id}
                        className="d-flex flex-column align-items-center"
                        style={{ width: '80px', cursor: "pointer" }}
                        onClick={() => handleSelect(template.id)}
                    >
                        {template?.description ? (
                            <Tooltip
                                overlayStyle={{ maxWidth: "300px" }}
                                title={
                                    <div
                                        className="template-tooltip-content"
                                        dangerouslySetInnerHTML={{ __html: template?.description }}
                                    />
                                }
                            >
                                {IconContainer}
                            </Tooltip>
                        ) : (
                            IconContainer
                        )}

                        {/* Title Label */}
                        <p
                            className="mt-2 text-center text-dark"
                            style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                lineHeight: "1.2",
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                                margin: 0
                            }}
                        >
                            {template.title}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

export default SolutionTemplateTab;
