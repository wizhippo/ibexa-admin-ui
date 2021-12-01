<?php

/**
 * @copyright Copyright (C) Ibexa AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace Ibexa\AdminUi\Form\DataTransformer\FieldType;

use Symfony\Component\Form\DataTransformerInterface;

/**
 * Data transformer for ezmedia field type.
 *
 * {@inheritdoc}
 */
class MediaValueTransformer extends AbstractBinaryBaseTransformer implements DataTransformerInterface
{
    /**
     * @param \Ibexa\Core\FieldType\Media\Value $value
     *
     * @return array
     */
    public function transform($value)
    {
        if (null === $value) {
            $value = $this->fieldType->getEmptyValue();
        }

        return array_merge(
            $this->getDefaultProperties(),
            [
                'hasController' => $value->hasController,
                'loop' => $value->loop,
                'autoplay' => $value->autoplay,
                'width' => $value->width,
                'height' => $value->height,
            ]
        );
    }

    /**
     * @param array $value
     *
     * @return \Ibexa\Core\FieldType\Media\Value
     *
     * @throws \Symfony\Component\Form\Exception\TransformationFailedException
     */
    public function reverseTransform($value)
    {
        /** @var \Ibexa\Core\FieldType\Media\Value $valueObject */
        $valueObject = $this->getReverseTransformedValue($value);

        if ($this->fieldType->isEmptyValue($valueObject)) {
            return $valueObject;
        }

        $valueObject->hasController = $value['hasController'];
        $valueObject->loop = $value['loop'];
        $valueObject->autoplay = $value['autoplay'];
        $valueObject->width = $value['width'];
        $valueObject->height = $value['height'];

        return $valueObject;
    }
}

class_alias(MediaValueTransformer::class, 'EzSystems\EzPlatformAdminUi\Form\DataTransformer\FieldType\MediaValueTransformer');
