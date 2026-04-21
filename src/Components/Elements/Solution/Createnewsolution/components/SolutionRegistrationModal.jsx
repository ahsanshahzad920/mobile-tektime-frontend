import React, { useEffect } from "react";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { useTranslation } from "react-i18next";

const SolutionRegistrationModal = () => {
    const { solution, formState, setFormState } = useSolutionFormContext();
    const [t] = useTranslation("global");

    useEffect(() => {
        if (solution) {
            setFormState((prevState) => ({
                ...prevState,
                price: solution.price || 0,
                max_participants_register: solution.max_participants_register || 0,
            }));
        }
    }, [solution, setFormState]);

    return (
        <div className="container mt-4" style={{ marginBlock: '1rem' }}>
            <form className="p-4 border rounded shadow-sm bg-light">
                <div className="mb-3">
                    <label htmlFor="maxParticipants" className="form-label">
                        {t("Maximum Participants")}:
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="maxParticipants"
                        value={formState.max_participants_register}
                        onChange={(e) =>
                            setFormState((prevState) => ({
                                ...prevState,
                                max_participants_register: e.target.value,
                            }))
                        }
                        min="1"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="price" className="form-label">
                        {t("Price")}:
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="price"
                        value={formState.price}
                        onChange={(e) =>
                            setFormState((prevState) => ({
                                ...prevState,
                                price: e.target.value,
                            }))
                        }
                        min="0"
                        required
                    />
                </div>
            </form>
        </div>
    );
};

export default SolutionRegistrationModal;
