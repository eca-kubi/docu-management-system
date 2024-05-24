import FileCard from './FileCard'
import {useCallback, useEffect} from "react";

const FileCardGrid = ({itemDatasource, gridClass = '', allCategories, onCardSelected, onCategoryUpdate}) => {


    const handleCardSelection = useCallback((id, isCardSelected) => {
        console.log(`Card with id ${id} is ${isCardSelected ? 'selected' : 'unselected'}`)
        onCardSelected(id, isCardSelected);
    }, [onCardSelected]);

    const renderCard =
        itemDatasource.items().map((item) => {
            return <FileCard key={item.id}
                             id={item.id}
                             fileType={item.fileType}
                             title={item.title}
                             uploadDate={item.uploadDateReadable}
                             defaultCategorySelection={item.categories}
                             // allCategories={allCategories && [...new Set([...item.categories, ...allCategories])]}
                             allCategories={Array.from(new Set([...item.categories, ...(allCategories || [])]))}
                             onCategoryUpdate={onCategoryUpdate}
                             onCardSelected={handleCardSelection}
            />
        })

    useEffect(() => {
        itemDatasource.load()
    }, [itemDatasource]);

    return (
        <div className={`row row-cols-1 row-cols-md-3 g-4 overflow-y-auto h-100 ${gridClass}`}>
            {itemDatasource.items().length > 0 ? renderCard : <div className="text-center">No data to display.</div>}
        </div>
    )
}

export default FileCardGrid