import { useState, useCallback, useEffect, useRef } from "react";

const useMeetingPolling = (fetchApi, activeDestination, isActive, isSearch = false) => {
    const [meetings, setMeetings] = useState([]);
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);

    // Use refs to access latest state in interval without resetting it
    const currentPageRef = useRef(currentPage);
    useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

    const fetchMeetings = useCallback(async (destinationId, page = 1, isPolling = false) => {
        if (!destinationId) return;

        try {
            if (page === 1 && !isPolling && !isSearch) setLoading(true);

            const meetingsData = await fetchApi(destinationId, page);

            let newMeetings = [];
            let paginationInfo = { current_page: 1, last_page: 1, total: 0 };

            if (meetingsData?.data?.current_page && Array.isArray(meetingsData.data.data)) {
                newMeetings = meetingsData.data.data;
                paginationInfo = {
                    current_page: meetingsData.data.current_page,
                    last_page: meetingsData.data.last_page,
                    total: meetingsData.data.total,
                };
            } else if (meetingsData?.current_page && Array.isArray(meetingsData.data)) {
                newMeetings = meetingsData.data;
                paginationInfo = {
                    current_page: meetingsData.current_page,
                    last_page: meetingsData.last_page,
                    total: meetingsData.total,
                };
            } else {
                newMeetings = Array.isArray(meetingsData?.data) ? meetingsData.data : [];
            }

            if (page === 1) {
                setMeetings(newMeetings);
                // Only set active meeting if it's not polling, OR if we had no active meeting (avoid disrupting user)
                // Original code reset it on polling too, which might be annoying.
                // I will keep original behavior for "click" (loading=true), but for polling (loading=false) I might want to preserve selection if it exists in new list.
                // But for now, let's replicate original logic:
                // Original polling logic: if (pageToFetch === 1) { ... setActiveEmailMeeting... }
                // Yes, it resets. I will stick to it to ensure consistency, but if user complains I can change it.
                // Actually, if I am reading a mail, I strictly don't want it to jump.
                // But `isPolling` flag allows me to control this.

                if (!isPolling) {
                    if (newMeetings.length > 0) {
                        setActiveMeeting(newMeetings[0].id);
                    } else {
                        setActiveMeeting(null);
                    }
                } else {
                    // If polling, we might update the list but try to keep active ID if it exists?
                    // Or just update list. The activeMeeting ID is state. If the ID is still in the new list, it stays valid.
                    // If the ID is gone, we might need to handle it. 
                    // The original code resets active meeting on poll. I will follow that to be safe.
                    if (newMeetings.length > 0) {
                        setActiveMeeting(newMeetings[0].id);
                    } else {
                        setActiveMeeting(null);
                    }
                }
            } else {
                const perPage = meetingsData?.data?.per_page || 10;
                setMeetings((prevMeetings) => {
                    const updated = [...prevMeetings];
                    const startIndex = (page - 1) * perPage;
                    if (startIndex < updated.length) {
                        updated.splice(startIndex, perPage, ...newMeetings);
                    } else {
                        updated.push(...newMeetings);
                    }
                    return updated;
                });
            }

            setPagination(paginationInfo);
            if (paginationInfo.current_page !== page) {
                setCurrentPage(paginationInfo.current_page);
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
        } finally {
            if (page === 1 && !isPolling && !isSearch) setLoading(false);
        }
    }, [fetchApi, isSearch]);

    const handleLoadMore = () => {
        if (pagination.current_page < pagination.last_page) {
            const nextPage = pagination.current_page + 1;
            setCurrentPage(nextPage);
            fetchMeetings(activeDestination, nextPage, false);
        }
    };

    // Initial Fetch when activeDestination changes or tab becomes active
    useEffect(() => {
        if (isActive && activeDestination) {
            fetchMeetings(activeDestination, 1, false);
        }
    }, [isActive, activeDestination, fetchMeetings]);

    // Polling
    useEffect(() => {
        if (!isActive || !activeDestination) return;

        const interval = setInterval(() => {
            // Poll currently viewed page
            // Note: Logic in original code polls `currentEmailPage`.
            fetchMeetings(activeDestination, currentPageRef.current, true);
        }, 60000);

        return () => clearInterval(interval);
    }, [isActive, activeDestination, fetchMeetings, isSearch]);

    return {
        meetings,
        setMeetings,
        activeMeeting,
        setActiveMeeting,
        loading,
        pagination,
        currentPage,
        handleLoadMore,
    };
};

export default useMeetingPolling;
