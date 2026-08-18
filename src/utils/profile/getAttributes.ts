const getAttributes = (data: any, imageId: string, imageAttribute: string) => {
    const attributes = data?.attributes || []

    const hasImageAttribute = attributes.some(
        ({ attribute }: any) => attribute === imageAttribute
    )

    const updatedAttributes = attributes.map(
        ({ attribute, value }: any) => ({
            attribute,
            value:
                attribute === imageAttribute
                    ? imageId
                    : value,
        })
    )

    if (!hasImageAttribute) {
        updatedAttributes.push({
            attribute: imageAttribute,
            value: imageId,
        })
    }

    return {
        trackedEntities: [
            {
                orgUnit: data?.orgUnit,
                trackedEntity: data?.trackedEntity,
                trackedEntityType: data?.trackedEntityType,
                attributes: updatedAttributes,
            }
        ]
    }
}

export { getAttributes }