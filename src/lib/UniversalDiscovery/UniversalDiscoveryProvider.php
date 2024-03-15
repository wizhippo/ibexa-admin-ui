<?php

/**
 * @copyright Copyright (C) Ibexa AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
declare(strict_types=1);

namespace Ibexa\AdminUi\UniversalDiscovery;

use Ibexa\AdminUi\Permission\LookupLimitationsTransformer;
use Ibexa\AdminUi\QueryType\LocationPathQueryType;
use Ibexa\Contracts\AdminUi\Permission\PermissionCheckerInterface;
use Ibexa\Contracts\AdminUi\UniversalDiscovery\Provider;
use Ibexa\Contracts\Core\Repository\BookmarkService;
use Ibexa\Contracts\Core\Repository\ContentService;
use Ibexa\Contracts\Core\Repository\ContentTypeService;
use Ibexa\Contracts\Core\Repository\LocationService;
use Ibexa\Contracts\Core\Repository\SearchService;
use Ibexa\Contracts\Core\Repository\Values\Content\Location;
use Ibexa\Contracts\Core\Repository\Values\Content\LocationQuery;
use Ibexa\Contracts\Core\Repository\Values\Content\Query;
use Ibexa\Contracts\Core\Repository\Values\Content\Search\SearchHit;
use Ibexa\Contracts\Core\Repository\Values\User\Limitation;
use Ibexa\Contracts\Rest\Output\Visitor;
use Ibexa\Rest\Server\Values\RestLocation;
use Ibexa\Rest\Server\Values\Version;

class UniversalDiscoveryProvider implements Provider
{
    private const COLUMNS_NUMBER = 4;

    /** @var \Ibexa\Contracts\Core\Repository\LocationService */
    private $locationService;

    /** @var \Ibexa\Contracts\Core\Repository\ContentTypeService */
    private $contentTypeService;

    /** @var \Ibexa\Contracts\Core\Repository\SearchService */
    private $searchService;

    /** @var \Ibexa\Contracts\Rest\Output\Visitor */
    private $visitor;

    /** @var \Ibexa\Contracts\Core\Repository\BookmarkService */
    private $bookmarkService;

    /** @var \Ibexa\Contracts\Core\Repository\ContentService */
    private $contentService;

    /** @var \Ibexa\Contracts\AdminUi\Permission\PermissionCheckerInterface */
    private $permissionChecker;

    /** @var \Ibexa\AdminUi\Permission\LookupLimitationsTransformer */
    private $lookupLimitationsTransformer;

    /** @var \Ibexa\AdminUi\QueryType\LocationPathQueryType */
    private $locationPathQueryType;

    private $sortClauseClassMap = [
        self::SORT_CLAUSE_DATE_PUBLISHED => Query\SortClause\DatePublished::class,
        self::SORT_CLAUSE_CONTENT_NAME => Query\SortClause\ContentName::class,
    ];

    private $availableSortOrder = [
        Query::SORT_ASC,
        Query::SORT_DESC,
    ];

    public function __construct(
        LocationService $locationService,
        ContentTypeService $contentTypeService,
        SearchService $searchService,
        BookmarkService $bookmarkService,
        ContentService $contentService,
        Visitor $visitor,
        PermissionCheckerInterface $permissionChecker,
        LookupLimitationsTransformer $lookupLimitationsTransformer,
        LocationPathQueryType $locationPathQueryType
    ) {
        $this->locationService = $locationService;
        $this->contentTypeService = $contentTypeService;
        $this->searchService = $searchService;
        $this->bookmarkService = $bookmarkService;
        $this->contentService = $contentService;
        $this->visitor = $visitor;
        $this->permissionChecker = $permissionChecker;
        $this->lookupLimitationsTransformer = $lookupLimitationsTransformer;
        $this->locationPathQueryType = $locationPathQueryType;
    }

    public function getColumns(
        int $locationId,
        int $limit,
        Query\SortClause $sortClause,
        bool $gridView = false,
        int $rootLocationId = Provider::ROOT_LOCATION_ID
    ): array {
        $location = $this->locationService->loadLocation($locationId);

        $locationPath = $this->getRelativeLocationPath($rootLocationId, $location->path);
        $locationPathCount = count($locationPath);

        $locationPathLast = $locationPathCount - 1;
        if ($locationPathCount > self::COLUMNS_NUMBER) {
            $columnLocations = [
                $locationPath[0], // First
                $locationPath[$locationPathLast - 2],
                $locationPath[$locationPathLast - 1],
                $locationPath[$locationPathLast], // Last
            ];
        } else {
            $columnLocations = $locationPath;
        }

        $locationPathIndex = max(0, $locationPathLast - 1);
        $lastColumnLocationId = (int) $locationPath[$locationPathIndex];

        $columns = [];
        foreach ($columnLocations as $columnLocationId) {
            $columnLocationId = (int)$columnLocationId;
            $columnLocation = ($columnLocationId !== self::ROOT_LOCATION_ID)
                ? $this->getRestFormat($this->locationService->loadLocation($columnLocationId))
                : null;

            $subItems = $this->getSubitemLocations($columnLocationId, 0, $limit, $sortClause);
            $isLastColumnLocationId = $columnLocationId === $lastColumnLocationId;
            $locations = $this->moveSelectedLocationOnTop($location, $subItems['locations'], $isLastColumnLocationId);

            $subItems['locations'] = $locations;

            $columns[$columnLocationId] = [
                'location' => $columnLocation,
                'subitems' => $subItems,
            ];
        }

        $columns[$locationId] = $gridView
            ? $this->getLocationGridViewData($locationId, 0, $limit, $sortClause)
            : $this->getLocationData($locationId, 0, $limit, $sortClause);

        return $columns;
    }

    public function getBreadcrumbLocations(
        int $locationId,
        int $rootLocationId = self::ROOT_LOCATION_ID
    ): array {
        $searchResult = $this->searchService->findLocations(
            $this->locationPathQueryType->getQuery([
                'location' => $this->locationService->loadLocation($locationId),
                'rootLocationId' => $rootLocationId,
            ])
        );

        return array_map(
            static function (SearchHit $searchHit) {
                return $searchHit->valueObject;
            },
            $searchResult->searchHits
        );
    }

    public function getLocations(array $locationIds): array
    {
        $searchResult = $this->searchService->findLocations(
            new LocationQuery([
                'filter' => new Query\Criterion\LocationId($locationIds),
            ])
        );

        return array_map(
            function (SearchHit $searchHit) {
                /** @var \Ibexa\Contracts\Core\Repository\Values\Content\Location $location */
                $location = $searchHit->valueObject;

                return [
                    'location' => $this->getRestFormat($location),
                    'permissions' => $this->getLocationPermissionRestrictions($location),
                ];
            },
            $searchResult->searchHits
        );
    }

    public function getLocationPermissionRestrictions(Location $location): array
    {
        $lookupCreateLimitationsResult = $this->permissionChecker->getContentCreateLimitations($location);
        $lookupUpdateLimitationsResult = $this->permissionChecker->getContentUpdateLimitations($location);

        $createLimitationsValues = $this->lookupLimitationsTransformer->getGroupedLimitationValues(
            $lookupCreateLimitationsResult,
            [Limitation::CONTENTTYPE, Limitation::LANGUAGE]
        );

        $updateLimitationsValues = $this->lookupLimitationsTransformer->getGroupedLimitationValues(
            $lookupUpdateLimitationsResult,
            [Limitation::CONTENTTYPE, Limitation::LANGUAGE]
        );

        return [
            'create' => [
                'hasAccess' => $lookupCreateLimitationsResult->hasAccess,
                'restrictedContentTypeIds' => $createLimitationsValues[Limitation::CONTENTTYPE],
                'restrictedLanguageCodes' => $createLimitationsValues[Limitation::LANGUAGE],
            ],
            'edit' => [
                'hasAccess' => $lookupUpdateLimitationsResult->hasAccess,
                'restrictedContentTypeIds' => $updateLimitationsValues[Limitation::CONTENTTYPE],
                'restrictedLanguageCodes' => $updateLimitationsValues[Limitation::LANGUAGE],
            ],
        ];
    }

    public function getSubitemContents(
        int $locationId,
        int $offset,
        int $limit,
        Query\SortClause $sortClause
    ): array {
        $searchResult = $this->searchService->findContent(
            new LocationQuery([
                'filter' => new Query\Criterion\ParentLocationId($locationId),
                'sortClauses' => [$sortClause],
                'offset' => $offset,
                'limit' => $limit,
            ])
        );

        return array_map(
            function (SearchHit $searchHit) {
                /** @var \Ibexa\Contracts\Core\Repository\Values\Content\Content $content */
                $content = $searchHit->valueObject;

                return $this->getRestFormat(
                    new Version($content, $content->getContentType(), [])
                );
            },
            $searchResult->searchHits
        );
    }

    public function getSubitemLocations(
        int $locationId,
        int $offset,
        int $limit,
        Query\SortClause $sortClause
    ): array {
        $searchResult = $this->searchService->findLocations(
            new LocationQuery([
                'filter' => new Query\Criterion\ParentLocationId($locationId),
                'sortClauses' => [$sortClause],
                'offset' => $offset,
                'limit' => $limit,
            ])
        );

        return [
            'locations' => array_map(
                function (SearchHit $searchHit) {
                    /** @var \Ibexa\Contracts\Core\Repository\Values\Content\Location $location */
                    $location = $searchHit->valueObject;
                    $restLocation = new RestLocation(
                        $location,
                        0 // Putting '0' here should suffice as this is not important from UDW standpoint
                    );

                    return $this->getRestFormat($restLocation);
                },
                $searchResult->searchHits
            ),
            'totalCount' => $searchResult->totalCount,
        ];
    }

    public function getLocationData(
        int $locationId,
        int $offset,
        int $limit,
        Query\SortClause $sortClause
    ): array {
        if ($locationId === self::ROOT_LOCATION_ID) {
            return [
                'subitems' => $this->getSubitemLocations($locationId, $offset, $limit, $sortClause),
            ];
        }

        $location = $this->locationService->loadLocation($locationId);
        $content = $this->contentService->loadContentByContentInfo($location->getContentInfo());
        $contentType = $this->contentTypeService->loadContentType($location->getContentInfo()->contentTypeId);

        return [
            'location' => $this->getRestFormat($location),
            'bookmarked' => $this->bookmarkService->isBookmarked($location),
            'permissions' => $this->getLocationPermissionRestrictions($location),
            'version' => $this->getRestFormat(new Version($content, $contentType, [])),
            'subitems' => $this->getSubitemLocations($locationId, $offset, $limit, $sortClause),
        ];
    }

    public function getLocationGridViewData(
        int $locationId,
        int $offset,
        int $limit,
        Query\SortClause $sortClause
    ): array {
        if ($locationId === self::ROOT_LOCATION_ID) {
            $locations = $this->getSubitemLocations($locationId, $offset, $limit, $sortClause);
            $versions = $this->getSubitemContents($locationId, $offset, $limit, $sortClause);

            return [
                'subitems' => [
                    'locations' => $locations['locations'],
                    'totalCount' => $locations['totalCount'],
                    'versions' => $versions,
                ],
            ];
        }

        $location = $this->locationService->loadLocation($locationId);
        $content = $this->contentService->loadContentByContentInfo($location->getContentInfo());
        $contentType = $this->contentTypeService->loadContentType($location->getContentInfo()->contentTypeId);

        $locations = $this->getSubitemLocations($locationId, $offset, $limit, $sortClause);
        $versions = $this->getSubitemContents($locationId, $offset, $limit, $sortClause);

        return [
            'location' => $this->getRestFormat($location),
            'bookmarked' => $this->bookmarkService->isBookmarked($location),
            'permissions' => $this->getLocationPermissionRestrictions($location),
            'version' => $this->getRestFormat(new Version($content, $contentType, [])),
            'subitems' => [
                'locations' => $locations['locations'],
                'totalCount' => $locations['totalCount'],
                'versions' => $versions,
            ],
        ];
    }

    public function getRestFormat($valueObject): array
    {
        return json_decode(
            $this->visitor->visit($valueObject)->getContent(),
            true
        );
    }

    public function getSortClause(string $sortClauseName, string $sortOrder): Query\SortClause
    {
        $sortClauseClass = $this->sortClauseClassMap[$sortClauseName] ?? $this->sortClauseClassMap[self::SORT_CLAUSE_DATE_PUBLISHED];
        $sortOrder = !in_array($sortOrder, $this->availableSortOrder)
            ? Query::SORT_ASC
            : $sortOrder;

        return new $sortClauseClass($sortOrder);
    }

    private function getRelativeLocationPath(int $locationId, array $locationPath): array
    {
        $locationIds = array_values($locationPath);

        $index = array_search($locationId, $locationIds);

        // Location is not part of path
        if ($index === false) {
            return [];
        }

        return array_slice($locationIds, $index);
    }

    private function moveSelectedLocationOnTop(Location $location, array $locations, bool $isLastColumnLocationId): array
    {
        $index = array_search($location->id, array_map(static function (array $location) {
            return $location['Location']['id'];
        }, $locations));

        // Location is on the list, remove because we add location on top
        if ($index !== false) {
            unset($locations[$index]);
            $locations = array_values($locations);
        }

        if ($isLastColumnLocationId) {
            array_unshift($locations, $this->getRestFormat($location));
        }

        return $locations;
    }
}

class_alias(UniversalDiscoveryProvider::class, 'EzSystems\EzPlatformAdminUi\UniversalDiscovery\UniversalDiscoveryProvider');
