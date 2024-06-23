import React, { useCallback, useEffect, useMemo, useState } from "react";
import FileCard from './FileCard';

const FileCardGrid = ({ itemDatasource, gridClass = '', allCategories, onCardSelected, onCategoryUpdate, refreshDocuments }) => {
    const [items, setItems] = useState([]);

    const handleCardSelection = useCallback((id, isCardSelected) => {
        console.log(`Card with id ${id} is ${isCardSelected ? 'selected' : 'unselected'}`);
        onCardSelected(id, isCardSelected);
    }, [onCardSelected]);

    const deleteHandler = useCallback((id) => {
        console.log(`File with id ${id} deleted`);
        refreshDocuments();
    }, [refreshDocuments]);

    useEffect(() => {
        const loadData = async () => {
            await itemDatasource.load();
            setItems(itemDatasource.items());
        };
        loadData().then(() => {
            console.log("Data loaded successfully"); // Debugging statement
        });
    }, [itemDatasource]);

    const combinedAndSortedCategories = useMemo(() => {
        return Array.from(new Set([...items.flatMap(item => item.categories), ...(allCategories || [])])).sort((a, b) => a.localeCompare(b));
    }, [items, allCategories]);

    const renderCard = useMemo(() => {
        console.log("Items:", items.length); // Debugging statement
        return items.map((item) => {
            const sortedItemCategories = [...item.categories].sort((a, b) => a.localeCompare(b));
            return (
                <FileCard
                    key={item.id}
                    id={item.id}
                    fileType={item.fileType}
                    title={item.title}
                    uploadDate={item["uploadDateReadable"]}
                    defaultCategorySelection={sortedItemCategories}
                    allCategories={combinedAndSortedCategories}
                    onCategoryUpdate={onCategoryUpdate}
                    onCardSelected={handleCardSelection}
                    deleteHandler={deleteHandler}
                />
            );
        });
    }, [items, combinedAndSortedCategories, onCategoryUpdate, handleCardSelection, deleteHandler]);

    return (
        <div className={`row row-cols-1 row-cols-md-3 g-4 overflow-y-auto h-100 ${gridClass}`}>
            {items.length > 0 ? renderCard : <div className="text-center">No data to display.</div>}
        </div>
    );
};

export default FileCardGrid;
